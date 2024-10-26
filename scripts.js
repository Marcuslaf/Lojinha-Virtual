const API_URL = "https://fakestoreapi.com";
let products = [];
let cart = [];
let user = null;

function toggleForm() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  }
}

function register() {
  const newUsername = document.getElementById("newUsername").value;
  const newPassword = document.getElementById("newPassword").value;

  if (!newUsername || !newPassword) {
    alert("Por favor, preencha todos os campos para o cadastro.");
    return;
  }

  if (localStorage.getItem(newUsername)) {
    alert("Usuário já cadastrado. Por favor, faça login.");
    return;
  }

  localStorage.setItem(newUsername, JSON.stringify({ password: newPassword }));
  alert("Cadastro realizado com sucesso! Você já pode fazer login.");
  toggleForm();
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Por favor, preencha os campos de usuário e senha.");
    return;
  }

  const storedUser = JSON.parse(localStorage.getItem(username));

  if (storedUser && storedUser.password === password) {
    user = { username };
    localStorage.setItem("currentUser", username);
    updateUserInfo();
    fetchProducts(); // Carrega os produtos após o login
  } else {
    alert("Usuário ou senha incorretos. Tente novamente.");
  }
}

function updateUserInfo() {
  const userInfoDiv = document.getElementById("userInfo");
  const loginFormDiv = document.getElementById("loginForm");
  const registerFormDiv = document.getElementById("registerForm");

  if (user) {
    userInfoDiv.innerHTML = `
            <p>Bem-vindo, ${user.username}!</p>
            <button onclick="logout()">Logout</button>
        `;
    loginFormDiv.style.display = "none";
    registerFormDiv.style.display = "none";
  } else {
    userInfoDiv.innerHTML = "";
    loginFormDiv.style.display = "block";
    registerFormDiv.style.display = "none";
  }
}

function logout() {
  user = null;
  localStorage.removeItem("currentUser");
  updateUserInfo();
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    products = await response.json();
    displayProducts();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }
}

function displayProducts() {
  const productsDiv = document.getElementById("products");
  productsDiv.innerHTML = products
    .map(
      (product) => `
                <div class="product">
                    <img src="${product.image}" alt="${
        product.title
      }" style="max-width: 100px;">
                    <h3>${product.title}</h3>
                    <p>R$ ${product.price.toFixed(2)}</p>
                    <button onclick="addToCart(${
                      product.id
                    })">Adicionar ao Carrinho</button>
                </div>
            `
    )
    .join("");
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

function updateCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartTotalDiv = document.getElementById("cartTotal");

  cartItemsDiv.innerHTML = cart
    .map(
      (item) => `
                <div class="cart-item">
                    <span>${item.title} (x${item.quantity})</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
                    <button onclick="removeFromCart(${
                      item.id
                    })">Remover</button>
                </div>
            `
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalDiv.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

async function fetchAddress() {
  const cep = document.getElementById("cep").value.replace(/\D/g, "");
  if (cep.length === 8) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const address = await response.json();
    if (!address.erro) {
      document.getElementById("street").value = address.logradouro;
      document.getElementById("neighborhood").value = address.bairro;
      document.getElementById("city").value = address.localidade;
      document.getElementById("state").value = address.uf;
    } else {
      alert("CEP não encontrado.");
    }
  }
}

function checkout() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  const deliveryInfo = {
    user: user.username,
    cart,
    address: {
      cep: document.getElementById("cep").value,
      street: document.getElementById("street").value,
      number: document.getElementById("number").value,
      neighborhood: document.getElementById("neighborhood").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
    },
  };

  console.log("Informações de entrega:", deliveryInfo);
  alert("Compra realizada com sucesso!");
  cart = [];
  updateCart();
}

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    user = { username: currentUser };
    updateUserInfo();
    fetchProducts();
  }
});