import { useState, useEffect } from "react";
import "./App.css";

const initialFoods = [
  { id: 1, name: "Masala Dosa", price: 40, category: "Breakfast", emoji: "🥞" },
  { id: 2, name: "Idli Sambar", price: 30, category: "Breakfast", emoji: "🍚" },
  { id: 3, name: "Puri", price: 35, category: "Breakfast", emoji: "🫓" },
  { id: 4, name: "Veg Meals", price: 70, category: "Lunch", emoji: "🍛" },
  { id: 5, name: "Chicken Biryani", price: 120, category: "Lunch", emoji: "🍗" },
  { id: 6, name: "Veg Fried Rice", price: 80, category: "Lunch", emoji: "🍜" },
  { id: 7, name: "Samosa", price: 15, category: "Snacks", emoji: "🥟" },
  { id: 8, name: "Sandwich", price: 40, category: "Snacks", emoji: "🥪" },
  { id: 9, name: "Cold Coffee", price: 50, category: "Drinks", emoji: "☕" },
  { id: 10, name: "Fresh Juice", price: 40, category: "Drinks", emoji: "🧃" },
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [page, setPage] = useState("home");

  const [foods, setFoods] = useState(() =>
    readStorage("campusFoods", initialFoods)
  );

  const [orders, setOrders] = useState(() =>
    readStorage("campusOrders", [])
  );

  const [student, setStudent] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminLogged, setAdminLogged] = useState(false);

  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [pickupTime, setPickupTime] = useState("");

  const [newFood, setNewFood] = useState({
    name: "",
    price: "",
    category: "Breakfast",
    emoji: "🍽️",
  });

  useEffect(() => {
    localStorage.setItem("campusFoods", JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem("campusOrders", JSON.stringify(orders));
  }, [orders]);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const addToCart = (food) => {
    setCart((oldCart) => {
      const found = oldCart.find((item) => item.id === food.id);

      if (found) {
        return oldCart.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...oldCart, { ...food, quantity: 1 }];
    });
  };

  const changeQuantity = (id, amount) => {
    setCart((oldCart) =>
      oldCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const studentLogin = (e) => {
    e.preventDefault();

    if (!studentName.trim() || !rollNumber.trim()) {
      alert("Please enter your name and roll number.");
      return;
    }

    setStudent({
      name: studentName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
    });

    setStudentName("");
    setRollNumber("");
    setPage("menu");
  };

  const adminLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      setAdminLogged(true);
      setUsername("");
      setPassword("");
      setPage("admin");
    } else {
      alert("Invalid admin username or password.");
    }
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Please add food items to your cart.");
      return;
    }

    if (!pickupTime) {
      alert("Please select your pickup time.");
      return;
    }

    const newOrder = {
      id: Date.now(),
      studentName: student.name,
      rollNumber: student.rollNumber,
      items: cart,
      total,
      date: new Date().toLocaleString(),
      pickupTime,
      status: "Pending",
    };

    setOrders((oldOrders) => [newOrder, ...oldOrders]);
    setCart([]);
    setPickupTime("");
    alert("Your order has been placed successfully!");
    setPage("myorders");
  };

  const updateStatus = (id, status) => {
    setOrders((oldOrders) =>
      oldOrders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  };

  const addFood = (e) => {
    e.preventDefault();

    if (!newFood.name.trim() || Number(newFood.price) <= 0) {
      alert("Enter a valid food name and price.");
      return;
    }

    setFoods((oldFoods) => [
      ...oldFoods,
      {
        ...newFood,
        id: Date.now(),
        name: newFood.name.trim(),
        price: Number(newFood.price),
      },
    ]);

    setNewFood({
      name: "",
      price: "",
      category: "Breakfast",
      emoji: "🍽️",
    });

    alert("Food item added successfully!");
  };

  const deleteFood = (id) => {
    if (window.confirm("Delete this food item?")) {
      setFoods((oldFoods) => oldFoods.filter((food) => food.id !== id));
    }
  };

  const logout = () => {
    setStudent(null);
    setAdminLogged(false);
    setCart([]);
    setPickupTime("");
    setPage("home");
  };

  const categories = ["All", "Breakfast", "Lunch", "Snacks", "Drinks"];

  const filteredFoods =
    category === "All"
      ? foods
      : foods.filter((food) => food.category === category);

  const myOrders = student
    ? orders.filter((order) => order.rollNumber === student.rollNumber)
    : [];

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo" onClick={() => setPage("home")}>
          🍽️ CampusBite
        </div>

        <nav>
          {!student && !adminLogged && (
            <button onClick={() => setPage("home")}>Home</button>
          )}

          {student && (
            <>
              <span className="welcome">Hi, {student.name}</span>
              <button onClick={() => setPage("menu")}>Menu</button>
              <button onClick={() => setPage("cart")}>
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
              <button onClick={() => setPage("myorders")}>My Orders</button>
              <button onClick={logout}>Logout</button>
            </>
          )}

          {adminLogged && (
            <>
              <button onClick={() => setPage("admin")}>Dashboard</button>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">
        {page === "home" && (
          <section className="hero">
            <div className="hero-content">
              <p className="tagline">SMART CAMPUS FOOD ORDERING</p>
              <h1>Welcome to CampusBite</h1>
              <h2>Your Campus Canteen, Just a Click Away!</h2>
              <p>
                Order your favourite food online and save your valuable time.
                Enjoy fresh and delicious food from your college canteen.
              </p>

              <div className="role-buttons">
                <button
                  className="primary-btn"
                  onClick={() => setPage("studentLogin")}
                >
                  🎓 Student Login
                </button>

                <button
                  className="admin-btn"
                  onClick={() => setPage("adminLogin")}
                >
                  🛠️ Admin Login
                </button>
              </div>
            </div>

            <div className="hero-emoji">🍔 🍕 🍟</div>
          </section>
        )}

        {page === "studentLogin" && (
          <section className="login-card">
            <div className="login-icon">🎓</div>
            <h1>Student Login</h1>
            <p>Enter your details to continue</p>

            <form onSubmit={studentLogin}>
              <label>Student Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />

              <label>Roll Number</label>
              <input
                type="text"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />

              <button className="primary-btn full-btn" type="submit">
                Login as Student
              </button>
            </form>

            <button className="back-btn" onClick={() => setPage("home")}>
              ← Back to Home
            </button>
          </section>
        )}

        {page === "adminLogin" && (
          <section className="login-card">
            <div className="login-icon">🛠️</div>
            <h1>Admin Login</h1>
            <p>Login to manage the canteen</p>

            <form onSubmit={adminLogin}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button className="admin-btn full-btn" type="submit">
                Login as Admin
              </button>
            </form>

            <p className="demo-login">
              Demo username: admin<br />
              Demo password: admin123
            </p>

            <button className="back-btn" onClick={() => setPage("home")}>
              ← Back to Home
            </button>
          </section>
        )}

        {page === "menu" && student && (
          <section>
            <div className="section-heading">
              <p className="tagline">FRESH & DELICIOUS</p>
              <h1>Our Food Menu</h1>
              <p>Choose your favourite food and add it to your cart.</p>
            </div>

            <div className="category-buttons">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active-category" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="food-grid">
              {filteredFoods.map((food) => (
                <div className="food-card" key={food.id}>
                  <div className="food-emoji">{food.emoji}</div>
                  <h3>{food.name}</h3>
                  <p>{food.category}</p>
                  <h2>₹{food.price}</h2>
                  <button
                    className="primary-btn"
                    onClick={() => addToCart(food)}
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === "cart" && student && (
          <section className="content-section">
            <h1>🛒 My Cart</h1>

            {cart.length === 0 ? (
              <div className="empty-message">
                <h2>Your cart is empty!</h2>
                <button className="primary-btn" onClick={() => setPage("menu")}>
                  Browse Food Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-list">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <h3>{item.emoji} {item.name}</h3>
                        <p>₹{item.price} × {item.quantity}</p>
                      </div>

                      <div className="quantity-controls">
                        <button onClick={() => changeQuantity(item.id, -1)}>
                          −
                        </button>
                        <strong>{item.quantity}</strong>
                        <button onClick={() => changeQuantity(item.id, 1)}>
                          +
                        </button>
                      </div>

                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div className="pickup-box">
                  <h3>⏰ Select Your Pickup Time</h3>
                  <p>When will you come to collect your order?</p>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                  />
                </div>

                <div className="total-box">
                  <h2>Total Amount: ₹{total}</h2>
                  <button className="primary-btn" onClick={placeOrder}>
                    Place Pre-Order
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {page === "myorders" && student && (
          <section className="content-section">
            <h1>📦 My Orders</h1>
            <p>Roll Number: {student.rollNumber}</p>

            {myOrders.length === 0 ? (
              <div className="empty-message">
                <h2>No orders yet!</h2>
                <button className="primary-btn" onClick={() => setPage("menu")}>
                  Order Food
                </button>
              </div>
            ) : (
              myOrders.map((order) => (
                <div className="order-card" key={order.id}>
                  <h3>Order #{String(order.id).slice(-6)}</h3>
                  <p>Date: {order.date}</p>
                  <p>⏰ Pickup Time: {order.pickupTime}</p>
                  <p>
                    Items: {order.items
                      .map((item) => `${item.name} × ${item.quantity}`)
                      .join(", ")}
                  </p>
                  <h3>Total: ₹{order.total}</h3>
                  <p className="status">
                    Order Status: <strong>{order.status}</strong>
                  </p>
                  {order.status === "Ready" && (
                    <p className="ready-message">
                      ✅ Your order is ready! Please collect it from the canteen.
                    </p>
                  )}
                  {order.status === "Collected" && (
                    <p className="collected-message">
                      🎉 Order successfully collected. Thank you!
                    </p>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {page === "admin" && adminLogged && (
          <section className="content-section">
            <div className="admin-heading">
              <div>
                <p className="tagline">CANTEEN MANAGEMENT</p>
                <h1>Admin Dashboard</h1>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h2>{orders.length}</h2>
                <p>Total Orders</p>
              </div>
              <div className="stat-card">
                <h2>{orders.filter((o) => o.status === "Pending").length}</h2>
                <p>Pending Orders</p>
              </div>
              <div className="stat-card">
                <h2>{foods.length}</h2>
                <p>Food Items</p>
              </div>
              <div className="stat-card">
                <h2>
                  ₹{orders
                    .filter((o) => o.status !== "Rejected")
                    .reduce((sum, order) => sum + order.total, 0)}
                </h2>
                <p>Order Value</p>
              </div>
            </div>

            <div className="admin-panel">
              <h2>➕ Add New Food Item</h2>

              <form className="add-food-form" onSubmit={addFood}>
                <input
                  type="text"
                  placeholder="Food name"
                  value={newFood.name}
                  onChange={(e) =>
                    setNewFood({ ...newFood, name: e.target.value })
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Price"
                  min="1"
                  value={newFood.price}
                  onChange={(e) =>
                    setNewFood({ ...newFood, price: e.target.value })
                  }
                  required
                />

                <select
                  value={newFood.category}
                  onChange={(e) =>
                    setNewFood({ ...newFood, category: e.target.value })
                  }
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Snacks</option>
                  <option>Drinks</option>
                </select>

                <input
                  type="text"
                  placeholder="Emoji"
                  value={newFood.emoji}
                  onChange={(e) =>
                    setNewFood({ ...newFood, emoji: e.target.value })
                  }
                />

                <button className="primary-btn" type="submit">
                  Add Food
                </button>
              </form>
            </div>

            <div className="admin-panel">
              <h2>🍽️ Manage Food Items</h2>

              {foods.map((food) => (
                <div className="admin-food-row" key={food.id}>
                  <span>{food.emoji} {food.name} — ₹{food.price}</span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteFood(food.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-panel">
              <h2>📋 Student Orders & Pickup Details</h2>

              {orders.length === 0 ? (
                <p>No orders received yet.</p>
              ) : (
                orders.map((order) => (
                  <div className="admin-order" key={order.id}>
                    <h3>Order #{String(order.id).slice(-6)}</h3>
                    <p>Student: {order.studentName}</p>
                    <p>Roll Number: {order.rollNumber}</p>
                    <p>Order Date: {order.date}</p>
                    <p>⏰ Student Pickup Time: {order.pickupTime || "Not selected"}</p>
                    <p>
                      Items: {order.items
                        .map((item) => `${item.name} × ${item.quantity}`)
                        .join(", ")}
                    </p>
                    <h3>Total: ₹{order.total}</h3>

                    <label>Update Order Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>Accepted</option>
                      <option>Preparing</option>
                      <option>Ready</option>
                      <option>Collected</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <h3>🍽️ CampusBite</h3>
        <p>Smart Food Ordering System for College Canteens</p>
        <p>© 2026 CampusBite. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;