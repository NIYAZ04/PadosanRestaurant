import { createContext, useEffect, useState } from "react";
import { food_list } from "../assests/assets";
export const StoreContext = createContext(null)
import axios from "axios";


// store context provider funtion 

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = import.meta.env.VITE_BACKEND_URL;
    const [token,setToken] = useState("");
    

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
        }

        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
        // sending to backend 
        if(token){
            await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
        }
        //
    }
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if(token){
            await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {

            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];

            }

        }
        return totalAmount;
    }
// function to store the cart data even after refreshing the website 
 const loadCartData= async(token)=>{
const response = await axios.post(url+"/api/cart/get",{},{header:{token}})
setCartItems(response.data.cartData);
 }

    useEffect(()=>{
        if (localStorage.getItem("token")) {
            setToken(localStorage.getItem("token"))
            
        }
    },[])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}
export default StoreContextProvider