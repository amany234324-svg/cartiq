// let category_nav_list = document.querySelector(".category_nav_list");

// function Open_Categ_list(){
//     category_nav_list.classList.toggle("active")

// }

// let nav_links = document.querySelector(".nav_links")

// function open_Menu() {
//     nav_links.classList.toggle("active")
// }


// var cart = document.querySelector('.cart');

// function open_close_cart() {
//     cart.classList.toggle("active")
// }

// fetch('products.json')
// .then(response => response.json())
// .then(data => {
    
//     const addToCartButtons = document.querySelectorAll(".btn_add_cart")

//     addToCartButtons.forEach(button =>{
//         button.addEventListener("click", (event) => {
//             const productId = event.target.getAttribute('data-id')
//             const selcetedProduct = data.find(product => product.id == productId)
            

//             addToCart(selcetedProduct)

//             const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)

//             allMatchingButtons.forEach(btn =>{
//                 btn.classList.add("active")
//                 btn.innerHTML = `      <i class="fa-solid fa-cart-shopping"></i> Item in cart`
//             })
//         })
//     })
    
    
// })


// function addToCart(product) {

//     let cart = JSON.parse(localStorage.getItem('cart')) || []

//     cart.push({... product , quantity: 1})
//     localStorage.setItem('cart' , JSON.stringify(cart))


//     updateCart()
// }



// function updateCart() {
//     const cartItemsContainer = document.getElementById("cart_items")

//     const cart = JSON.parse(localStorage.getItem('cart')) || []


//     var total_Price = 0
//     var total_count = 0

//     cartItemsContainer.innerHTML = "" ;
//     cart.forEach((item , index) => {

//         let total_Price_item = item.price * item.quantity;

//         total_Price += total_Price_item
//         total_count += item.quantity

    
//         cartItemsContainer.innerHTML += `
        
//             <div class="item_cart">
//                 <img src="${item.img}" alt="">
//                 <div class="content">
//                     <h4>${item.name}</h4>
//                     <p class="price_cart">$${total_Price_item}</p>
//                     <div class="quantity_control">
//                         <button class="decrease_quantity" data-index=${index}>-</button>
//                         <span class="quantity">${item.quantity}</span>
//                         <button class="Increase_quantity" data-index=${index}>+</button>
//                     </div>
//                 </div>

//                 <button class="delete_item" data-inex="${index}" ><i class="fa-solid fa-trash-can"></i></button>
//             </div>


//         `
//     })


//     const price_cart_total = document.querySelector('.price_cart_toral')
    
//     const count_item_cart = document.querySelector('.Count_item_cart')

//     const count_item_header = document.querySelector('.count_item_header')
    
//     price_cart_total.innerHTML = `$ ${total_Price}`

//     count_item_cart.innerHTML = total_count

//     count_item_header.innerHTML = total_count


//     const increaseButtons = document.querySelectorAll(".Increase_quantity")
//     const decreaseButtons = document.querySelectorAll(".decrease_quantity")

//     increaseButtons.forEach(button => {
//         button.addEventListener("click" , (event) =>{
//             const itemIndex = event.target.getAttribute("data-index")
//             increaseQuantity(itemIndex)
//         })
//     })


//     decreaseButtons.forEach(button => {
//         button.addEventListener("click" , (event) =>{
//             const itemIndex = event.target.getAttribute("data-index")
//             decreaseQuantity(itemIndex)
//         })
//     })



//     const delteButtons = document.querySelectorAll('.delete_item')
    
//     delteButtons.forEach(button =>{
//         button.addEventListener('click' , (event) =>{
//             const itemIndex = event.target.closest('button').getAttribute('data-inex')
//             removeFromCart(itemIndex)
//         })
//     })

// }


// function increaseQuantity(index){
//     let cart = JSON.parse(localStorage.getItem('cart')) || []
//     cart[index].quantity += 1
//     localStorage.setItem('cart' , JSON.stringify(cart))
//     updateCart()
// }

// function decreaseQuantity(index){
//     let cart = JSON.parse(localStorage.getItem('cart')) || []

//     if (cart[index].quantity > 1){
//         cart[index].quantity -= 1
//     }
 
//     localStorage.setItem('cart' , JSON.stringify(cart))
//     updateCart()
// }





// function removeFromCart(index) {
//     const cart = JSON.parse(localStorage.getItem('cart')) || []

//     const removeProduct = cart.splice(index , 1)[0]
//     localStorage.setItem('cart', JSON.stringify(cart))
//     updateCart()
//     updateButoonsState(removeProduct.id)
// }


// function updateButoonsState(productId) {
//     const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)
//     allMatchingButtons.forEach(button =>{
//         button.classList.remove('active');
//         button.innerHTML = `      <i class="fa-solid fa-cart-shopping"></i> add to cart`
//     })
// }

// updateCart()
// var swiper = new Swiper(".slide-swp", {
//     pagination: {
//       el: ".swiper-pagination",
//       dynamicBullests: true,
//       clickable:true
//     },
//     autoplay:{
//         delay:2500,
//     },
//     loop:true
//   });


//   /* swiper slide products */

//   var swiper = new Swiper(".slide_product", {
//     slidesPerView: 5,
//     spaceBetween:20,
//     autoplay:{
//         delay:2500,
//     },
//     navigation:{
//         nextEl:".swiper-button-next",
//         prevEl:".swiper-button-prev"
//     },
//     loop:true,
//     breakpoints:{
//       1200:{
//         slidesPerView : 5,
//         spaceBetween: 20
//       },
//       1000:{
//         slidesPerView : 4,
//         spaceBetween: 20
//       },
//       700:{
//         slidesPerView: 3 , 
//         spaceBetween: 15 ,

//       },
//       0:{
//         slidesPerView : 2,
//         spaceBetween: 10
//       }
//     }
//   });
//   fetch('products.json')
// .then(response => response.json())
// .then(data => {
 
//     const cart = JSON.parse(localStorage.getItem('cart')) || []

//     const swiper_items_sale = document.getElementById("swiper_items_sale")

//     const swiper_elctronics = document.getElementById("swiper_elctronics")


//     const swiper_appliances = document.getElementById("swiper_appliances")

//     const swiper_mobiles = document.getElementById("swiper_mobiles")


//     data.forEach(product => {
//         if(product.old_price){

//             const isInCart = cart.some(cartItem => cartItem.id === product.id)

//             const percent_disc = Math.floor((product.old_price - product.price) / product.old_price * 100)
            
//             swiper_items_sale.innerHTML += `


//              <div class="swiper-slide product">
//                         <span class="sale_present">%${percent_disc}</span>

//                         <div class="img_product">
//                             <a href="#"><img src="${product.img}" alt=""></a>
//                         </div>

//                         <div class="stars">
//                             <i class="fa-solid fa-star"></i>
//                             <i class="fa-solid fa-star"></i>
//                             <i class="fa-solid fa-star"></i>
//                             <i class="fa-solid fa-star"></i>
//                             <i class="fa-solid fa-star"></i>
//                         </div>

//                         <p class="name_product"><a href="#">${product.name}</a></p>

//                         <div class="price">
//                             <p><span>$${product.price}</span></p>
//                             <p class="old_price">$${product.old_price}</p>
//                         </div>

//                         <div class="icons">
//                             <span class="btn_add_cart ${isInCart ? 'active' : ''}" data-id="${product.id}">
//                                 <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'add to cart'}
//                             </span>
//                             <span class="icon_product"><i class="fa-regular fa-heart"></i></span>
//                         </div>
//                     </div>
            
            
            
            
//             `
            
            
//         }
//     })


//     data.forEach(product => {
//         if(product.catetory == "electronics"){


//             const isInCart = cart.some(cartItem => cartItem.id === product.id)


//             const old_price_Pargrahp = product.old_price ? `<p class="old_price">$${product.old_price}</p>` : "";

//             const percent_disc_div = product.old_price ? `<span class="sale_present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>` : "";



//             swiper_elctronics.innerHTML += `


//             <div class="swiper-slide product">
                       
//                         ${percent_disc_div}
//                        <div class="img_product">
//                            <a href="#"><img src="${product.img}" alt=""></a>
//                        </div>

//                        <div class="stars">
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                        </div>

//                        <p class="name_product"><a href="#">${product.name}</a></p>

//                        <div class="price">
//                            <p><span>$${product.price}</span></p>
//                            ${old_price_Pargrahp}
//                        </div>

//                        <div class="icons">
//                            <span class="btn_add_cart ${isInCart ? 'active' : ''}" data-id="${product.id}">
//                                 <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'add to cart'}
//                             </span>
//                            <span class="icon_product"><i class="fa-regular fa-heart"></i></span>
//                        </div>
//                    </div>
           
           
           
           
//            `



//         }
//     })


//     data.forEach(product => {
//         if(product.catetory == "appliances"){

//             const isInCart = cart.some(cartItem => cartItem.id === product.id)

//             const old_price_Pargrahp = product.old_price ? `<p class="old_price">$${product.old_price}</p>` : "";

//             const percent_disc_div = product.old_price ? `<span class="sale_present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>` : "";



//             swiper_appliances.innerHTML += `


//             <div class="swiper-slide product">
                       
//                         ${percent_disc_div}
//                        <div class="img_product">
//                            <a href="#"><img src="${product.img}" alt=""></a>
//                        </div>

//                        <div class="stars">
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                        </div>

//                        <p class="name_product"><a href="#">${product.name}</a></p>

//                        <div class="price">
//                            <p><span>$${product.price}</span></p>
//                            ${old_price_Pargrahp}
//                        </div>

//                        <div class="icons">
//                         <span class="btn_add_cart ${isInCart ? 'active' : ''}" data-id="${product.id}">
//                                 <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'add to cart'}
//                             </span>
//                            <span class="icon_product"><i class="fa-regular fa-heart"></i></span>
//                        </div>
//                    </div>
           
           
           
           
//            `



//         }
//     })


//     data.forEach(product => {
//         if(product.catetory == "mobiles"){

//             const isInCart = cart.some(cartItem => cartItem.id === product.id)

//             const old_price_Pargrahp = product.old_price ? `<p class="old_price">$${product.old_price}</p>` : "";

//             const percent_disc_div = product.old_price ? `<span class="sale_present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>` : "";



//             swiper_mobiles.innerHTML += `


//             <div class="swiper-slide product">
                       
//                         ${percent_disc_div}
//                        <div class="img_product">
//                            <a href="#"><img src="${product.img}" alt=""></a>
//                        </div>

//                        <div class="stars">
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                            <i class="fa-solid fa-star"></i>
//                        </div>

//                        <p class="name_product"><a href="#">${product.name}</a></p>

//                        <div class="price">
//                            <p><span>$${product.price}</span></p>
//                            ${old_price_Pargrahp}
//                        </div>

//                        <div class="icons">
//                          <span class="btn_add_cart ${isInCart ? 'active' : ''}" data-id="${product.id}">
//                                 <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'add to cart'}
//                             </span>
//                            <span class="icon_product"><i class="fa-regular fa-heart"></i></span>
//                        </div>
//                    </div>
           
           
           
           
//            `



//         }
//     })
    
// })