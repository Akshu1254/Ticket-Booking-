const express=require("express");
const cors=require("cors");
const helmet=require("helmet");
const rateLimit=require("express-rate-limit");
const crypto=require("crypto");
const Database=require("better-sqlite3");
const path=require("path");

const app=express(),PORT=process.env.PORT||3000;
const KEY_ID=process.env.RAZORPAY_KEY_ID,KEY_SECRET=process.env.RAZORPAY_KEY_SECRET;
const FRONTEND_ORIGIN=process.env.FRONTEND_ORIGIN||"https://akshu1254.github.io";
const DB_PATH=process.env.DATABASE_PATH||path.join(__dirname,"ticketbooker.sqlite");
const db=new Database(DB_PATH);
db.pragma("journal_mode=WAL");
db.exec(`CREATE TABLE IF NOT EXISTS payment_orders(
 order_id TEXT PRIMARY KEY, booking_id TEXT NOT NULL UNIQUE, amount INTEGER NOT NULL,
 booking_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'created',
 payment_id TEXT, created_at TEXT NOT NULL
)`);
app.use(helmet());
app.use(cors({origin:FRONTEND_ORIGIN.split(",").map(x=>x.trim()),methods:["GET","POST"],allowedHeaders:["Content-Type"]}));
app.use(express.json({limit:"20kb"}));
app.use("/api/",rateLimit({windowMs:60000,limit:30,standardHeaders:true,legacyHeaders:false}));
const PRICES={1:220,2:230,3:250,4:220,5:200,6:210,7:220,8:280,9:300,10:320,11:260,12:250,13:230,14:200,15:210,16:300,17:320};
const clean=(v,n=120)=>String(v||"").trim().slice(0,n);
function amountFor(movieId,seats){
 const base=PRICES[Number(movieId)];
 if(!base||!Array.isArray(seats)||seats.length<1||seats.length>8||new Set(seats).size!==seats.length)throw new Error("Invalid movie or seat selection.");
 return seats.reduce((sum,seat)=>{if(typeof seat!=="string"||! /^[A-H](10|[1-9])$/.test(seat))throw new Error("Invalid seat selection.");return sum+base+("GH".includes(seat[0])?100:0)},0)*100;
}
async function razorpay(pathname,method,body){
 const auth=Buffer.from(KEY_ID+":"+KEY_SECRET).toString("base64");
 const response=await fetch("https://api.razorpay.com/v1"+pathname,{method,headers:{Authorization:"Basic "+auth,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const data=await response.json();if(!response.ok)throw new Error(data.error?.description||"Razorpay request failed.");return data;
}
app.get("/health",(_req,res)=>res.json({ok:true,service:"TicketBooker Razorpay API"}));
app.post("/api/create-order",async(req,res)=>{
 try{
  if(!KEY_ID||!KEY_SECRET)return res.status(503).json({error:"Razorpay keys are not configured on the backend."});
  const {bookingId,movieId,movieTitle,date,time,seats,name,phone}=req.body||{};
  const amount=amountFor(movieId,seats);
  if(!/^[A-Za-z0-9_-]{4,40}$/.test(String(bookingId||""))||clean(name,80).length<2||!/^[0-9]{10}$/.test(String(phone||""))||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(date||""))||!clean(time,30))return res.status(400).json({error:"Booking details are incomplete. Return to seat selection."});
  const previous=db.prepare("SELECT status FROM payment_orders WHERE booking_id=?").get(bookingId);
  if(previous?.status==="paid")return res.status(409).json({error:"This booking has already been paid."});
  const booking={id:bookingId,movieId:Number(movieId),movieTitle:clean(movieTitle),date,time:clean(time,30),seats:[...seats].sort(),total:amount/100,name:clean(name,80),phone:String(phone),bookedAt:new Date().toISOString()};
  const order=await razorpay("/orders","POST",{amount,currency:"INR",receipt:bookingId.slice(0,40),notes:{booking_id:bookingId,movie_id:String(movieId)}});
  db.prepare("INSERT INTO payment_orders(order_id,booking_id,amount,booking_json,status,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(booking_id) DO UPDATE SET order_id=excluded.order_id,amount=excluded.amount,booking_json=excluded.booking_json,status='created',payment_id=NULL,created_at=excluded.created_at")
   .run(order.id,bookingId,amount,JSON.stringify(booking),"created",new Date().toISOString());
  res.json({key:KEY_ID,orderId:order.id,amount:order.amount,currency:order.currency});
 }catch(error){console.error("Create order:",error);res.status(400).json({error:error.message||"Unable to create payment order."})}
});
app.post("/api/verify-payment",async(req,res)=>{
 try{
  if(!KEY_ID||!KEY_SECRET)return res.status(503).json({verified:false,error:"Razorpay keys are not configured on the backend."});
  const {bookingId,razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=req.body||{};
  const saved=db.prepare("SELECT * FROM payment_orders WHERE order_id=? AND booking_id=?").get(orderId,bookingId);
  if(!saved)return res.status(400).json({verified:false,error:"This payment order was not created by this server."});
  if(saved.status==="paid")return res.json({verified:true,booking:{...JSON.parse(saved.booking_json),paymentStatus:"Paid",paymentId:saved.payment_id,orderId}});
  if(![orderId,paymentId,signature].every(v=>typeof v==="string"&&v.length>5))return res.status(400).json({verified:false,error:"Missing payment verification details."});
  const expected=crypto.createHmac("sha256",KEY_SECRET).update(orderId+"|"+paymentId).digest(),received=Buffer.from(signature,"hex");
  if(received.length!==expected.length||!crypto.timingSafeEqual(received,expected))return res.status(400).json({verified:false,error:"Razorpay signature mismatch. Ticket not issued."});
  const [payment,order]=await Promise.all([razorpay("/payments/"+encodeURIComponent(paymentId),"GET"),razorpay("/orders/"+encodeURIComponent(orderId),"GET")]);
  if(payment.order_id!==orderId||payment.status!=="captured"||payment.amount!==saved.amount||payment.currency!=="INR"||order.status!=="paid"||order.amount_paid!==saved.amount)return res.status(409).json({verified:false,error:"Payment is not captured for the expected amount. Check Razorpay Dashboard and automatic capture settings."});
  const booking={...JSON.parse(saved.booking_json),paymentStatus:"Paid",paymentId,orderId};
  db.prepare("UPDATE payment_orders SET status='paid',payment_id=? WHERE order_id=?").run(paymentId,orderId);
  res.json({verified:true,booking});
 }catch(error){console.error("Verify payment:",error);res.status(500).json({verified:false,error:error.message||"Payment verification failed. Check Razorpay Dashboard before retrying."})}
});
app.listen(PORT,()=>console.log("TicketBooker Razorpay API listening on "+PORT));
