const express=require("express");
const cors=require("cors");
const helmet=require("helmet");
const rateLimit=require("express-rate-limit");
const crypto=require("crypto");

const app=express(),PORT=process.env.PORT||3000;
const KEY_ID=process.env.RAZORPAY_KEY_ID,KEY_SECRET=process.env.RAZORPAY_KEY_SECRET;
const FRONTEND_ORIGIN=process.env.FRONTEND_ORIGIN||"https://akshu1254.github.io";
app.use(helmet());
app.use(cors({origin:FRONTEND_ORIGIN.split(",").map(x=>x.trim()),methods:["GET","POST"],allowedHeaders:["Content-Type"]}));
app.use(express.json({limit:"20kb"}));
app.use("/api/",rateLimit({windowMs:60000,limit:30,standardHeaders:true,legacyHeaders:false}));
const PRICES={1:220,2:230,3:250,4:220,5:200,6:210,7:220,8:280,9:300,10:320,11:260,12:250,13:230,14:200,15:210,16:300,17:320};
const clean=(v,n=120)=>String(v||"").trim().slice(0,n);
function calculateAmount(movieId,seats){
 const base=PRICES[Number(movieId)];
 if(!base||!Array.isArray(seats)||seats.length<1||seats.length>8||new Set(seats).size!==seats.length)throw new Error("Invalid movie or seat selection.");
 return seats.reduce((sum,seat)=>{if(typeof seat!=="string"||! /^[A-H](10|[1-9])$/.test(seat))throw new Error("Invalid seat selection.");return sum+base+("GH".includes(seat[0])?100:0)},0)*100;
}
async function razorpay(path,method,body){
 const auth=Buffer.from(KEY_ID+":"+KEY_SECRET).toString("base64");
 const response=await fetch("https://api.razorpay.com/v1"+path,{method,headers:{Authorization:"Basic "+auth,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const data=await response.json();if(!response.ok)throw new Error(data.error?.description||"Razorpay API request failed.");return data;
}
app.get("/health",(_req,res)=>res.json({ok:true,service:"TicketBooker Razorpay API"}));
app.post("/api/create-order",async(req,res)=>{
 try{
  if(!KEY_ID||!KEY_SECRET)return res.status(503).json({error:"Razorpay keys are not configured on the backend."});
  const {bookingId,movieId,movieTitle,date,time,seats,name,phone}=req.body||{};
  const amount=calculateAmount(movieId,seats);
  if(!/^[A-Za-z0-9_-]{4,40}$/.test(String(bookingId||""))||clean(name,80).length<2||!/^[0-9]{10}$/.test(String(phone||""))||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(date||""))||!clean(time,30))return res.status(400).json({error:"Booking details are incomplete. Return to seat selection."});
  const notes={booking_id:String(bookingId),movie_id:String(movieId),movie_title:clean(movieTitle,120),show_date:String(date),show_time:clean(time,30),seats:seats.join(","),customer_name:clean(name,80),customer_phone:String(phone)};
  const order=await razorpay("/orders","POST",{amount,currency:"INR",receipt:"tb_"+crypto.randomBytes(8).toString("hex"),notes});
  res.json({key:KEY_ID,orderId:order.id,amount:order.amount,currency:order.currency});
 }catch(error){console.error("Create order:",error);res.status(400).json({error:error.message||"Unable to create payment order."})}
});
app.post("/api/verify-payment",async(req,res)=>{
 try{
  if(!KEY_ID||!KEY_SECRET)return res.status(503).json({verified:false,error:"Razorpay keys are not configured on the backend."});
  const {bookingId,razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=req.body||{};
  if(![bookingId,orderId,paymentId,signature].every(v=>typeof v==="string"&&v.length>5))return res.status(400).json({verified:false,error:"Missing payment verification details."});
  const expected=crypto.createHmac("sha256",KEY_SECRET).update(orderId+"|"+paymentId).digest(),received=Buffer.from(signature,"hex");
  if(received.length!==expected.length||!crypto.timingSafeEqual(received,expected))return res.status(400).json({verified:false,error:"Razorpay signature mismatch. Ticket not issued."});
  const [payment,order]=await Promise.all([razorpay("/payments/"+encodeURIComponent(paymentId),"GET"),razorpay("/orders/"+encodeURIComponent(orderId),"GET")]);
  if(order.notes?.booking_id!==bookingId)return res.status(400).json({verified:false,error:"Booking reference does not match this Razorpay order."});
  const seats=String(order.notes?.seats||"").split(",").filter(Boolean),movieId=Number(order.notes?.movie_id);
  const expectedAmount=calculateAmount(movieId,seats);
  if(payment.order_id!==orderId||payment.status!=="captured"||payment.amount!==expectedAmount||order.amount!==expectedAmount||payment.currency!=="INR"||order.status!=="paid"||order.amount_paid!==expectedAmount)return res.status(409).json({verified:false,error:"Payment is not captured for the expected amount. Check Razorpay Dashboard and automatic capture settings."});
  const booking={id:bookingId,movieId,movieTitle:order.notes.movie_title,date:order.notes.show_date,time:order.notes.show_time,seats:seats.sort(),total:expectedAmount/100,name:order.notes.customer_name,phone:order.notes.customer_phone,bookedAt:new Date().toISOString(),paymentStatus:"Paid",paymentId,orderId};
  res.json({verified:true,booking});
 }catch(error){console.error("Verify payment:",error);res.status(500).json({verified:false,error:error.message||"Payment verification failed. Check Razorpay Dashboard before retrying."})}
});
app.listen(PORT,()=>console.log("TicketBooker Razorpay API listening on port "+PORT));
