import { useEffect, useState } from "react";
import Products from "./components/Product/Products";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import CategoryProducts from "./components/Product/CategoryProducts";
import ProductDetails from "./components/Product/ProductDetails";
import CartItems from "./components/Cart/CartItems";
import Login from "./components/Pages/Login";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import CreateProduct from "./components/Pages/CreateProduct";
import NewProducts from "./components/Pages/NewProducts";
import Footer from "./components/Footer";
import ThemeContext from "./contextAPi/ThemeContext";

function App() {
  const [apiData, setApiData] = useState([]);
  const [cartItem, setCartItem] = useState([]);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newProducts, setNewProducts] = useState([]);
  const [productToEdit, setProductToEdit] = useState(null);
  const [theme, setTheme] = useState("light");
  const [qty, setQty] = useState(() =>
    Object.fromEntries(cartItem.map((item) => [item.id, 1]))
  );

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const auth = localStorage.getItem("authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("https://fakestoreapi.com/products")
        .then((res) => res.json())
        .then((data) => {
          let localProducts = [];
          try {
            const parsed = JSON.parse(localStorage.getItem("formData"));
            if (Array.isArray(parsed)) {
              localProducts = parsed;
            }
          } catch (e) {
            console.warn("Failed to parse local createdProducts:", e);
          }
          console.log(
            "Raw formData from localStorage:",
            localStorage.getItem("formData")
          );

          setNewProducts([...localProducts]);
          setApiData([...data, ...localProducts]);
        })
        .catch((err) => console.error("Failed to fetch products:", err));
    }
  }, [isAuthenticated]);

  const updateLocalProducts = (updatedList) => {
    setNewProducts(updatedList);
    setApiData((prev) => {
      const apiOnly = prev.filter(
        (p) => !updatedList.find((np) => np.id === p.id)
      );
      return [...apiOnly, ...updatedList];
    });
    localStorage.setItem("formData", JSON.stringify(updatedList));
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = newProducts.filter((product) => product.id !== id);
    setNewProducts(updatedProducts);
    localStorage.setItem("formData", JSON.stringify(updatedProducts));
    setApiData((prev) => {
      const apiOnly = prev.filter((p) => p.id !== id);
      return [...apiOnly, ...updatedProducts];
    });
  };

  const addToCart = (product) => {
    setCartItem((prev) => {
      const updatedCart = [...prev, product];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItem(JSON.parse(storedCart));
    }
  }, []);

  function handleRemoveCartProduct(id) {
    const cartUpdatedProducts = cartItem.filter((prev) => prev.id !== id);
    setCartItem(cartUpdatedProducts);
    localStorage.setItem("cart", JSON.stringify(cartUpdatedProducts));
  }

  function handleQtyMinus(id) {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] - 1),
    }));
  }
  function handleQtyPlus(id) {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + 1),
    }));
  }

  useEffect(() => {
    setQty((prevQty) => {
      const newQty = { ...prevQty };
      cartItem.forEach((item) => {
        if (!(item.id in newQty)) {
          newQty[item.id] = 1;
        }
      });
      return newQty;
    });
  }, [cartItem]);

  const handleLogin = (email, password) => {
    if (email && password) {
      localStorage.setItem("authenticated", "true");
      setIsAuthenticated(true);
      navigate("/products");
    } else {
      alert("Invalid Credentials");
    }
  };

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     const timeout = setTimeout(() => {
  //       setIsAuthenticated(false);
  //       console.log("Session timed out");
  //       navigate("/login");
  //     }, 300000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [isAuthenticated]);

  function handleNewCreatedProduct(newData) {
    let stored = [];
    try {
      const raw = localStorage.getItem("formData");
      if (raw) {
        const parsed = JSON.parse(raw);
        // If parsed is an array, assign directly, else wrap it in an array
        stored = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch {
      stored = [];
    }
    localStorage.setItem("formData", JSON.stringify([...stored, newData]));
    setApiData((prev) => [...prev, newData]);
  }

  return (
    <div className={theme === "dark" ? "dark" : "light"}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className=" dark:bg-black dark:text-white min-h-screen">
          {isAuthenticated && (
            <ResponsiveAppBar setIsAuthenticated={setIsAuthenticated} />
          )}
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/products" />
                ) : (
                  <Login setLogin={handleLogin} />
                )
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Products apiData={apiData} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/:id"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ProductDetails apiData={apiData} addToCart={addToCart} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category/:categoryName"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <CategoryProducts apiData={apiData} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <CartItems
                    cartItem={cartItem}
                    removeProduct={handleRemoveCartProduct}
                    qty={qty}
                    handleQtyMinus={handleQtyMinus}
                    handleQtyPlus={handleQtyPlus}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/createproduct"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <CreateProduct
                    handleNewCreatedProduct={handleNewCreatedProduct}
                    setProductToEdit={setProductToEdit}
                    productToEdit={productToEdit}
                    updateLocalProducts={updateLocalProducts}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/newproducts"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <NewProducts
                    newProducts={newProducts}
                    setProductToEdit={setProductToEdit}
                    onDeleteProduct={handleDeleteProduct}
                  />
                </ProtectedRoute>
              }
            />
            {/* Redirect all unknown routes to /login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          <Footer />
        </div>
      </ThemeContext.Provider>
    </div>
  );
}

export default App;
