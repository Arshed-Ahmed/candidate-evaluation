import "./Header.css";
import { CgHeart } from "react-icons/cg";
import React, {useState, useEffect} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { GrSearch } from "react-icons/gr";
import { useData } from "../../contexts/DataProvider.js";
import { useAuth } from "../../contexts/AuthProvider.js";
import { CgShoppingCart } from "react-icons/cg";
import { useUserData } from "../../contexts/UserDataProvider.js";
import { FaWallet } from "react-icons/fa";
import { BrowserProvider } from "ethers";
import axios from "axios";

export const Header = () => {
  const { auth } = useAuth();
  const { dispatch } = useData();
  const navigate = useNavigate();
  const { userDataState } = useUserData();
  const [showHamburger, setShowHamburger] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const getActiveStyle = ({ isActive }) => {
    return { color: isActive ? "white" : "" };
  };

  const totalProductsInCart = userDataState.cartProducts?.reduce(
    (acc, curr) => {
      return acc + curr.qty;
    },
    0
  );

  const isProductInCart = () => (Number(totalProductsInCart) ? true : false);

  const totalProductsInWishlist = userDataState.wishlistProducts.length;

  const isProductInWishlist = () =>
    Number(totalProductsInWishlist) ? true : false;

  const connectWallet = async () => {
    if (walletAddress) {
      setStatus("Wallet already connected: " + walletAddress);
      return;
    }
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setStatus("Wallet connected: " + address);
    } catch (err) {
      setStatus("Connection failed: " + err.message);
    }
  };

  const simulatePayment = async () => {
    if (!walletAddress) {
      setStatus("Connect wallet first");
      return;
    }
    setIsLoading(true);

    const mockPayment = {
      wallet_address: walletAddress,
      amount: "0.01 ETH",
      timestamp: new Date().toISOString(),
    };

    await axios.post("/api/payment/simulate", mockPayment, {
      baseURL: window.location.origin
    })
    .then((response) => {
      setStatus("Success: " + response.data.message);
      setIsLoading(false);
    })
    .catch((error) => {
      setStatus("Payment simulation failed: " + error.message);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    console.log(status);
  }, [status]);

  return (
    <nav>
      <div className="nav-logo-home-button">
        <NavLink style={getActiveStyle} to="/">
          <img
            src="./assets/icons/logo.png"
            alt="AWU Logo"
            className="logo-image"
          />
          <span className="brand-name">Art Waves</span>
        </NavLink>
      </div>

      <div className="nav-input-search">
        <input
          onChange={(e) =>
            dispatch({ type: "SEARCH", payload: e.target.value })
          }
          onKeyDown={(e) => {
            e.key === "Enter" && navigate("/product-listing");
          }}
          placeholder="Search"
        />
        <button>
          <GrSearch />
        </button>
      </div>

      <div
        className={
          !showHamburger
            ? "nav-link-container-mobile nav-link-container"
            : "nav-link-container"
        }
      >
        <NavLink
            onClick={() => connectWallet()}
            style={getActiveStyle}
          >
          <FaWallet /> {walletAddress ? "Connected" : "Connect"}
        </NavLink>
        {walletAddress && (
          <NavLink
            onClick={() => simulatePayment()}
            style={getActiveStyle}
          >
            {isLoading ? "Paying..." : "Simulate Payment"}
          </NavLink>
        )}
        <NavLink
          onClick={() => setShowHamburger(true)}
          style={getActiveStyle}
          to="/product-listing"
        >
          Explore
        </NavLink>
        <NavLink
          onClick={() => setShowHamburger(true)}
          style={getActiveStyle}
          to={auth.isAuth ? "/profile" : "/login"}
        >
          {!auth.isAuth ? "Login" : "Profile"}
        </NavLink>
        <NavLink
          onClick={() => setShowHamburger(true)}
          style={getActiveStyle}
          to="wishlist"
        >
          <span>{!showHamburger ? "Wishlist" : ""}</span>
          <CgHeart size={25} className="wishlist" />{" "}
          {isProductInWishlist() && (
            <span className="cart-count cart-count-mobile">
              {totalProductsInWishlist}
            </span>
          )}
        </NavLink>
        <NavLink
          onClick={() => setShowHamburger(true)}
          style={getActiveStyle}
          to="/cart"
        >
          <span>{!showHamburger ? "Cart" : ""}</span>
          <CgShoppingCart size={25} className="cart" />{" "}
          {isProductInCart() && (
            <span className="cart-count cart-count-mobile">
              {" "}
              {totalProductsInCart}{" "}
            </span>
          )}
        </NavLink>
      </div>
      {showHamburger && (
        <div className="hamburger-icon" onClick={() => setShowHamburger(false)}>
          <RxHamburgerMenu size={20} />
        </div>
      )}
      {!showHamburger && (
        <div
          className="cross-tab-icon cross-tab-icon-mobile"
          onClick={() => setShowHamburger(true)}
        >
          <RxCross2 color={"rgb(106, 106, 65)"} size={25} />
        </div>
      )}
    </nav>
  );
};
