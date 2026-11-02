/* Razorpay Standard Checkout. All secrets stay on the backend. */
const pending=(()=>{try{return JSON.parse(localStorage.getItem("pendingBooking"))}catch{return null}})();
const byId=id=>document.getElementById(id),payButton=byId("payNow"),message=byId("paymentMessage");
const API_BASE=String(window.TICKETBOOKER_API_BASE||"").replace(/\/$/,"");
function showMessage(text,error=false){message.textContent=text;message.classList.toggle("is-error",error);message.classList.toggle("is-success",!error)}
function busy(value,label){payButton.disabled=value;payButton.textContent=label}
if(!pending||!pending.id||!Array.isArray(pending.seats)||!pending.seats.length){byId("checkoutError").classList.remove("hidden");byId("checkoutContent").classList.add("hidden")}
else{
 byId("checkoutContent").classList.remove("hidden");
 byId("movieTitle").textContent=pending.movieTitle||"Movie ticket";
 byId("showDate").textContent=typeof prettyDate==="function"?prettyDate(pending.date):pending.date;
 byId("showTime").textContent=pending.time||"—";byId("showSeats").textContent=pending.seats.join(", ");
 byId("bookingId").textContent=pending.id;byId("customerName").textContent=pending.name||"—";
 byId("totalAmount").textContent="₹"+Number(pending.total||0).toFixed(2);
 byId("paymentTotal").textContent="₹"+Number(pending.total||0).toFixed(2);
 byId("backToSeats").href="booking.html?id="+encodeURIComponent(pending.movieId);
}
async function startPayment(){
 if(!pending)return;
 if(!API_BASE||API_BASE.includes("YOUR-RENDER-SERVICE")){showMessage("Payment server is not deployed yet. Deploy the backend and set its URL first.",true);return}
 if(!window.Razorpay){showMessage("Razorpay Checkout did not load. Check your internet connection.",true);return}
 busy(true,"Creating secure order…");showMessage("");
 try{
  const r=await fetch(API_BASE+"/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:pending.id,movieId:pending.movieId,movieTitle:pending.movieTitle,date:pending.date,time:pending.time,seats:pending.seats,name:pending.name,phone:pending.phone})});
  const order=await r.json();if(!r.ok)throw new Error(order.error||"Could not create payment order");
  const checkout=new Razorpay({key:order.key,amount:order.amount,currency:order.currency,name:"TicketBooker",description:(pending.movieTitle||"Movie")+" movie tickets",order_id:order.orderId,prefill:{name:pending.name||"",contact:pending.phone||""},notes:{booking_id:pending.id},theme:{color:"#f04462"},
   handler:async response=>{
    busy(true,"Verifying payment…");showMessage("Payment submitted. Verifying securely with the server…");
    try{
     const vr=await fetch(API_BASE+"/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:pending.id,razorpay_order_id:response.razorpay_order_id,razorpay_payment_id:response.razorpay_payment_id,razorpay_signature:response.razorpay_signature})});
     const result=await vr.json();if(!vr.ok||!result.verified||!result.booking)throw new Error(result.error||"Payment could not be verified");
     const list=getBookings(),i=list.findIndex(x=>x.id===result.booking.id);if(i>=0)list[i]=result.booking;else list.push(result.booking);
     saveBookings(list);localStorage.removeItem("pendingBooking");location.href="confirm.html?id="+encodeURIComponent(result.booking.id);
    }catch(e){showMessage(e.message||"Verification failed. Check payment status before retrying.",true);busy(false,"Retry verification")}
   },
   modal:{ondismiss:()=>{busy(false,"Pay securely");showMessage("Checkout closed. No ticket has been issued yet.",true)}}
  });
  checkout.on("payment.failed",e=>{showMessage(e.error?.description||"Payment failed. Please retry.",true);busy(false,"Retry payment")});
  checkout.open();
 }catch(e){showMessage(e.message||"Unable to connect to payment server.",true);busy(false,"Pay securely")}
}
if(payButton)payButton.addEventListener("click",startPayment);
