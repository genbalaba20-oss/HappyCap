const PRODUCTS = [
	{
		id: 1,
		name: "Classic Black Cap",
		cat: "Classic",
		price: 799,
		img: "1.jpg",
		badge: "Best Seller",
		badgeClass: "",
		desc: "A timeless silhouette in deep matte black. Structured front panel, adjustable back strap. The cap that never goes out of style.",
		size: "Adjustable (fits most)",
		material: "100% Cotton Twill",
		stars: 4.8,
		reviews: 124,
		featured: true,
		stock: 124,
	},
	{
		id: 2,
		name: "Vintage Denim Cap",
		cat: "Vintage",
		price: 949,
		img: "5.jpg",
		badge: "",
		badgeClass: "",
		desc: "Stone-washed denim with a lived-in look. Unstructured crown, curved brim. Perfect for casual weekend wear.",
		size: "Adjustable",
		material: "Denim / Cotton Blend",
		stars: 4.6,
		reviews: 89,
		featured: true,
		stock: 89,
	},
	{
		id: 3,
		name: "Streetwear Red Snapback",
		cat: "Streetwear",
		price: 1099,
		img: "3.jpg",
		badge: "Hot",
		badgeClass: "",
		desc: "Bold red colorway with a flat brim and classic snapback closure. The statement piece your fit needs.",
		size: "Snapback (adjustable)",
		material: "Polyester / Wool Blend",
		stars: 4.9,
		reviews: 156,
		featured: true,
		stock: 156,
	},
	{
		id: 4,
		name: "Sport White Athletic Cap",
		cat: "Sport",
		price: 649,
		img: "2.jpg",
		badge: "",
		badgeClass: "",
		desc: "Lightweight moisture-wicking fabric with ventilation eyelets. Built for movement, looks great off the court too.",
		size: "Adjustable Velcro",
		material: "Polyester / Spandex",
		stars: 4.7,
		reviews: 203,
		featured: false,
		stock: 203,
	},
	{
		id: 5,
		name: "Trucker Green Cap",
		cat: "Trucker",
		price: 749,
		img: "4.jpg",
		badge: "New",
		badgeClass: "new",
		desc: "Mesh back panel for breathability, foam front for structure. The classic trucker silhouette in fresh sage green.",
		size: "Snapback (adjustable)",
		material: "Foam Front / Mesh Back",
		stars: 4.5,
		reviews: 78,
		featured: false,
		stock: 78,
	},
];

const ACCOUNTS = [
	{
		email: "admin@happcap.ph",
		pass: "admin123",
		role: "admin",
		name: "Admin HappCap",
		phone: "09627530644",
		addr: "Cebu City, Philippines",
	},
	{
		email: "user@happcap.ph",
		pass: "user123",
		role: "user",
		firstName: "Juan",
		lastName: "dela Cruz",
		phone: "09171234567",
		addr: "123 Mango Ave, Cebu City",
	},
];

let currentUser = JSON.parse(localStorage.getItem("hc_user") || "null");
let cart = JSON.parse(localStorage.getItem("hc_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("hc_orders") || "[]");
let products = JSON.parse(
	localStorage.getItem("hc_products") || JSON.stringify(PRODUCTS),
);
let registeredUsers = JSON.parse(localStorage.getItem("hc_regusers") || "[]");
let currentRating = 0;
let shopFilter = "All";
let searchTerm = "";
let productToAddAfterLogin = null;

if (products.length < PRODUCTS.length) {
	products = PRODUCTS;
	localStorage.setItem("hc_products", JSON.stringify(products));
}

document.addEventListener("DOMContentLoaded", () => {
	renderFeatured();
	renderShop();
	renderReviewsList();
	renderCartUI();
	updateCartCount();
	updateAccountMenu();
	prefillCheckout();
});

function showPage(p) {
	document
		.querySelectorAll(".page")
		.forEach((x) => x.classList.remove("active"));
	const el = document.getElementById("page-" + p);
	if (el) el.classList.add("active");
	window.scrollTo({ top: 0, behavior: "smooth" });
	document
		.querySelectorAll(".nav-links a")
		.forEach((a) => a.classList.toggle("active", a.dataset.page === p));
	if (p === "dashboard") renderDashboard();
	if (p === "admin") renderAdmin();
	if (p === "checkout") {
		prefillCheckout();
		updateCoSummary();
	}
	if (p === "shop") renderShop();
	if (p === "reviews") renderReviewsList();
	closeAccountMenu();
	closeCart();
}

function toggleNav() {
	document.getElementById("navLinks").classList.toggle("open");
	document.getElementById("mobOverlay").classList.toggle("open");
}
function closeNav() {
	document.getElementById("navLinks").classList.remove("open");
	document.getElementById("mobOverlay").classList.remove("open");
}
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		closeModal();
		closeCart();
		closeNav();
		document.getElementById("acctMenu")?.classList.add("hidden");
	}
});

function renderFeatured() {
	const g = document.getElementById("featuredGrid");
	if (!g) return;
	g.innerHTML = PRODUCTS.filter((p) => p.featured)
		.map((p) => pcHTML(p))
		.join("");
}

function renderShop() {
	const g = document.getElementById("shopGrid");
	if (!g) return;
	let list = [...products];
	if (shopFilter !== "All")
		list = list.filter((p) =>
			p.cat.toLowerCase().includes(shopFilter.toLowerCase()),
		);
	if (searchTerm)
		list = list.filter(
			(p) =>
				p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				p.cat.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	const sort = document.getElementById("sortSel")?.value;
	if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
	else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
	else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
	else if (sort === "rating") list.sort((a, b) => b.stars - a.stars);
	g.innerHTML = list.length
		? list.map((p) => pcHTML(p)).join("")
		: `<p style="grid-column:1/-1;color:var(--grey-lt);font-style:italic;padding:50px 0">No caps found.</p>`;
}

function starStr(n) {
	const full = Math.floor(n);
	return (
		"★".repeat(full) + (n % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(n))
	);
}

function pcHTML(p) {
	const out = p.stock <= 0;
	return `
  <div class="product-card" onclick="openProductModal(${p.id})">
    <div class="pc-img">
      <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'"/>
      ${p.badge ? `<span class="pc-badge ${p.badgeClass}">${p.badge}</span>` : ""}
      ${out ? `<span class="pc-badge" style="background:var(--grey);color:var(--dark)">Sold Out</span>` : ""}
    </div>
    <div class="pc-body">
      <p class="pc-cat">${p.cat}</p>
      <p class="pc-name">${p.name}</p>
      <div class="pc-stars">★★★★★</div>
      <p class="pc-stock-info">${p.stars} · (${p.reviews} reviews) · ${p.stock} in stock</p>
      <div class="pc-foot">
        <div><p class="pc-price">₱${p.price.toLocaleString()}</p></div>
        <button class="pc-add" onclick="event.stopPropagation();addToCart(${p.id})" ${out ? "disabled" : ""} title="Add to basket">+</button>
      </div>
    </div>
  </div>`;
}

function setShopFilter(val, btn) {
	shopFilter = val;
	document
		.querySelectorAll("#catFilters .ftab")
		.forEach((b) => b.classList.remove("active"));
	if (btn) btn.classList.add("active");
	else
		document.querySelectorAll("#catFilters .ftab").forEach((b) => {
			if (
				(val === "All" && b.textContent.trim() === "All") ||
				b.textContent.trim().toLowerCase().includes(val.toLowerCase())
			)
				b.classList.add("active");
		});
	renderShop();
}

function handleSearch(v) {
	searchTerm = v;
	renderShop();
	if (v) showPage("shop");
}

function openProductModal(id) {
	const p = products.find((x) => x.id === id);
	if (!p) return;
	const out = p.stock <= 0;
	document.getElementById("modalContent").innerHTML = `
    <div class="modal-img"><img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'"/></div>
    <div class="modal-body">
      <p class="m-cat">${p.cat}</p>
      <h2 class="m-name">${p.name}</h2>
      <p class="m-price">₱${p.price.toLocaleString()}</p>
      <div class="m-stars">★★★★★ <span style="font-family:var(--font-b);font-size:.78rem;color:var(--grey-lt)">${p.stars} (${p.reviews} reviews)</span></div>
      <p class="m-desc">${p.desc}</p>
      <div class="m-specs">
        <div class="m-spec"><span class="m-spec-label">Size</span><span class="m-spec-val">${p.size}</span></div>
        <div class="m-spec"><span class="m-spec-label">Material</span><span class="m-spec-val">${p.material}</span></div>
        <div class="m-spec"><span class="m-spec-label">Stock</span><span class="m-spec-val">${p.stock} units</span></div>
      </div>
      <p class="m-stock" style="color:${out ? "#e74c3c" : p.stock <= 5 ? "#f39c12" : "var(--yellow)"}">
        ${out ? "✕ Out of Stock" : p.stock <= 5 ? `⚠ Only ${p.stock} left!` : `✓ In Stock`}
      </p>
      <div class="m-actions">
        <button class="btn-primary" onclick="addToCart(${p.id});closeModal()" ${out ? "disabled" : ""}>Add to Basket</button>
        <button class="btn-dark" onclick="closeModal()">Close</button>
      </div>
    </div>`;
	document.getElementById("productModal").classList.remove("hidden");
}
function closeModal() {
	document.getElementById("productModal").classList.add("hidden");
}

function addToCart(id) {
	if (!currentUser) {
		productToAddAfterLogin = id;
		showToast("Please sign in to add items!");
		setTimeout(() => showPage("auth"), 800);
		return;
	}
	const p = products.find((x) => x.id === id);
	if (!p || p.stock <= 0) {
		showToast("Sorry, this cap is out of stock.");
		return;
	}
	p.stock--;
	localStorage.setItem("hc_products", JSON.stringify(products));
	const ex = cart.find((c) => c.id === id);
	if (ex) ex.qty++;
	else
		cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
	saveCart();
	showToast(`"${p.name}" added to your basket!`);
	renderShop();
	renderFeatured();
}

function saveCart() {
	localStorage.setItem("hc_cart", JSON.stringify(cart));
	renderCartUI();
	updateCartCount();
}

function updateCartCount() {
	document.getElementById("cartCount").textContent = cart.reduce(
		(s, c) => s + c.qty,
		0,
	);
}

function openCart() {
	document.getElementById("cartSidebar").classList.add("open");
	document.getElementById("cartOverlay").classList.add("open");
}
function closeCart() {
	document.getElementById("cartSidebar").classList.remove("open");
	document.getElementById("cartOverlay").classList.remove("open");
}

function renderCartUI() {
	const el = document.getElementById("cartItems");
	const tot = document.getElementById("cartTotal");
	if (!el) return;
	if (!cart.length) {
		el.innerHTML = `<div class="cart-empty"><p>Your basket is empty.</p></div>`;
		if (tot) tot.textContent = "₱0";
		return;
	}
	el.innerHTML = cart
		.map(
			(i) => `
    <div class="cart-item">
      <div class="ci-img"><img src="${i.img}" alt="${i.name}" onerror="this.style.display='none'"/></div>
      <div class="ci-info">
        <p class="ci-name">${i.name}</p>
        <p class="ci-price">₱${i.price.toLocaleString()}</p>
        <div class="ci-qty">
          <button class="cq-btn" onclick="changeQty(${i.id},-1)">−</button>
          <span class="cq-num">${i.qty}</span>
          <button class="cq-btn" onclick="changeQty(${i.id},1)">+</button>
        </div>
        <p class="ci-remove" onclick="removeFromCart(${i.id})">Remove</p>
      </div>
    </div>`,
		)
		.join("");
	if (tot)
		tot.textContent = `₱${cart.reduce((s, c) => s + c.price * c.qty, 0).toLocaleString()}`;
}

function changeQty(id, d) {
	const item = cart.find((c) => c.id === id);
	const prod = products.find((p) => p.id === id);
	if (!item) return;
	if (d === 1) {
		if (prod && prod.stock > 0) {
			prod.stock--;
			item.qty++;
			localStorage.setItem("hc_products", JSON.stringify(products));
		} else {
			showToast("No more stock!");
			return;
		}
	} else {
		item.qty--;
		if (prod) {
			prod.stock++;
			localStorage.setItem("hc_products", JSON.stringify(products));
		}
		if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
	}
	saveCart();
	renderShop();
	renderFeatured();
}

function removeFromCart(id) {
	const item = cart.find((c) => c.id === id);
	const prod = products.find((p) => p.id === id);
	if (item && prod) {
		prod.stock += item.qty;
		localStorage.setItem("hc_products", JSON.stringify(products));
	}
	cart = cart.filter((c) => c.id !== id);
	saveCart();
	renderShop();
	renderFeatured();
}

function goCheckout() {
	if (!currentUser) {
		showToast("Please sign in to checkout.");
		setTimeout(() => showPage("auth"), 800);
		return;
	}
	closeCart();
	showPage("checkout");
}

function prefillCheckout() {
	if (!currentUser) return;
	const u = currentUser;
	const set = (id, val) => {
		const el = document.getElementById(id);
		if (el && val) el.value = val;
	};
	if (u.role === "admin") {
		set("co-first", "Admin");
		set("co-last", "HappCap");
		set("co-email", u.email);
	} else {
		set("co-first", u.firstName || "");
		set("co-last", u.lastName || "");
		set("co-email", u.email || "");
		set("co-phone", u.phone || "");
		set("co-addr", u.addr || "");
	}
}

function updateCoSummary() {
	const el = document.getElementById("coItems");
	if (!el) return;
	el.innerHTML = cart
		.map(
			(i) => `
    <div class="co-item">
      <img src="${i.img}" alt="${i.name}" onerror="this.style.display='none'"/>
      <div class="co-item-info"><p class="cin">${i.name} ×${i.qty}</p><p class="cip">₱${(i.price * i.qty).toLocaleString()}</p></div>
    </div>`,
		)
		.join("");
	const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
	const subEl = document.getElementById("coSub");
	if (subEl) subEl.textContent = `₱${sub.toLocaleString()}`;
	const totEl = document.getElementById("coTotal");
	if (totEl) totEl.textContent = `₱${(sub + 150).toLocaleString()}`;
}

function placeOrder() {
	if (!currentUser) {
		showToast("Please sign in first.");
		showPage("auth");
		return;
	}
	if (!cart.length) {
		showToast("Your basket is empty!");
		return;
	}
	const fname = document.getElementById("co-first")?.value.trim();
	const lname = document.getElementById("co-last")?.value.trim();
	if (!fname || !lname) {
		showToast("Please fill in your shipping details.");
		return;
	}
	const oid = "HC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
	orders.push({
		id: oid,
		userId: currentUser.email,
		userName: fname + " " + lname,
		userEmail: document.getElementById("co-email")?.value || currentUser.email,
		userPhone: document.getElementById("co-phone")?.value || "",
		userAddr: document.getElementById("co-addr")?.value || "",
		items: [...cart],
		status: "Processing",
		total: cart.reduce((s, c) => s + c.price * c.qty, 0) + 150,
		date: new Date().toLocaleDateString("en-PH"),
		payment:
			document.querySelector("input[name=pay]:checked")?.value || "gcash",
	});
	localStorage.setItem("hc_orders", JSON.stringify(orders));
	cart = [];
	saveCart();
	showToast(`Order placed! ID: ${oid}`);
	showPage("dashboard");
}

function trackOrder() {
	const input = document.getElementById("trackInput").value.trim();
	const res = document.getElementById("trackResult");
	if (!input) {
		showToast("Please enter an Order ID.");
		return;
	}
	const order = orders.find((o) => o.id === input);
	res.classList.remove("hidden");
	if (!order) {
		res.innerHTML = `<p style="color:#e74c3c;font-weight:600">Order not found. Check your Order ID and try again.</p>`;
		return;
	}
	const steps = ["Processing", "Packing", "Shipped", "Delivered"];
	const ci = steps.indexOf(order.status);
	res.innerHTML = `
    <p class="tr-id">Order ${order.id}</p>
    <div class="tr-detail">
      <strong style="color:var(--white)">Customer:</strong> ${order.userName}<br/>
      <strong style="color:var(--white)">Date:</strong> ${order.date}<br/>
      <strong style="color:var(--white)">Items:</strong><br/>${order.items.map((i) => `— ${i.name} ×${i.qty}`).join("<br/>")}
      <br/><strong style="color:var(--white)">Total:</strong> ₱${order.total.toLocaleString()}
    </div>
    <div class="track-steps">
      ${steps
				.map((s, i) => {
					const state = i < ci ? "done" : i === ci ? "current" : "pending";
					return `${i > 0 ? `<div class="ts-line ${i <= ci ? "done" : ""}"></div>` : ""}
          <div class="ts ${state}">
            <div class="ts-dot">${i < ci ? "✓" : i + 1}</div>
            <span class="ts-label">${s}</span>
          </div>`;
				})
				.join("")}
    </div>`;
}

function switchAuth(tab) {
	document
		.getElementById("authLogin")
		.classList.toggle("hidden", tab !== "login");
	document
		.getElementById("authReg")
		.classList.toggle("hidden", tab !== "register");
	document
		.querySelectorAll(".auth-tab")
		.forEach((t) =>
			t.classList.toggle(
				"active",
				t.textContent.toLowerCase().includes(tab === "login" ? "sign" : "reg"),
			),
		);
}

function doLogin() {
	const email = document
		.getElementById("loginEmail")
		.value.trim()
		.toLowerCase();
	const pass = document.getElementById("loginPass").value;
	let user = ACCOUNTS.find((a) => a.email === email && a.pass === pass);
	if (!user)
		user = registeredUsers.find((u) => u.email === email && u.pass === pass);
	if (!user) {
		showToast("Invalid email or password.");
		return;
	}
	currentUser = user;
	localStorage.setItem("hc_user", JSON.stringify(user));
	updateAccountMenu();
	showToast(`Welcome back, ${user.firstName || user.name}!`);
	if (productToAddAfterLogin) {
		const id = productToAddAfterLogin;
		productToAddAfterLogin = null;
		addToCart(id);
	}
	showPage(user.role === "admin" ? "admin" : "home");
}

function doRegister() {
	const first = document.getElementById("regFirst").value.trim();
	const last = document.getElementById("regLast").value.trim();
	const email = document.getElementById("regEmail").value.trim().toLowerCase();
	const phone = document.getElementById("regPhone").value.trim();
	const addr = document.getElementById("regAddr").value.trim();
	const pass = document.getElementById("regPass").value;
	if (!first || !last || !email || !pass) {
		showToast("Please fill in all required fields.");
		return;
	}
	if (
		ACCOUNTS.find((a) => a.email === email) ||
		registeredUsers.find((u) => u.email === email)
	) {
		showToast("Email already registered.");
		return;
	}
	const newUser = {
		email,
		pass,
		role: "user",
		firstName: first,
		lastName: last,
		phone,
		addr,
	};
	registeredUsers.push(newUser);
	localStorage.setItem("hc_regusers", JSON.stringify(registeredUsers));
	currentUser = newUser;
	localStorage.setItem("hc_user", JSON.stringify(newUser));
	updateAccountMenu();
	showToast(`Welcome to HappCap, ${first}!`);
	showPage("home");
}

function doLogout() {
	currentUser = null;
	cart = [];
	localStorage.removeItem("hc_user");
	localStorage.removeItem("hc_cart");
	updateCartCount();
	renderCartUI();
	updateAccountMenu();
	showToast("Signed out successfully.");
	showPage("home");
}

function toggleAccountMenu() {
	const m = document.getElementById("acctMenu");
	m.classList.toggle("hidden");
	if (!m.classList.contains("hidden")) updateAccountMenu();
}
function closeAccountMenu() {
	document.getElementById("acctMenu")?.classList.add("hidden");
}
document.addEventListener("click", (e) => {
	const btn = document.getElementById("acctBtn");
	const menu = document.getElementById("acctMenu");
	if (menu && !menu.contains(e.target) && btn && !btn.contains(e.target))
		menu.classList.add("hidden");
});

function updateAccountMenu() {
	const el = document.getElementById("acctMenuContent");
	if (!el) return;
	const s = `font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:500;display:block;width:100%;text-align:left;padding:10px 18px;border:none;cursor:pointer;background:none;color:rgba(51, 36, 0, 0.6);transition:background .2s;`;
	const h = `onmouseenter="this.style.background='var(--dark-2)'" onmouseleave="this.style.background='none'"`;
	if (!currentUser) {
		el.innerHTML = `
      <div style="padding:14px 18px;border-bottom:1px solid var(--border-2)">
        <p style="font-family:'Syne',sans-serif;font-size:.95rem;font-weight:800;color:var(--white)">Welcome</p>
        <p style="font-size:.72rem;color:var(--grey);margin-top:2px">Sign in to your account</p>
      </div>
      <button style="${s}" onclick="closeAccountMenu();showPage('auth')" ${h}>Sign In / Register</button>`;
	} else if (currentUser.role === "admin") {
		el.innerHTML = `
      <div style="padding:14px 18px;border-bottom:1px solid var(--border-2)">
        <p style="font-family:'Syne',sans-serif;font-size:.9rem;font-weight:800;color:var(--yellow)">Admin Panel</p>
        <p style="font-size:.72rem;color:var(--grey);margin-top:2px">${currentUser.email}</p>
      </div>
      <button style="${s}" onclick="closeAccountMenu();showPage('admin')" ${h}>Dashboard</button>
      <button style="${s};color:rgba(231,76,60,.8)" onclick="doLogout()">Sign Out</button>`;
	} else {
		const name = currentUser.firstName || currentUser.name;
		el.innerHTML = `
      <div style="padding:14px 18px;border-bottom:1px solid var(--border-2)">
        <p style="font-family:'Syne',sans-serif;font-size:.9rem;font-weight:800;color:var(--white)">${name}</p>
        <p style="font-size:.72rem;color:var(--grey);margin-top:2px">${currentUser.email}</p>
      </div>
      <button style="${s}" onclick="closeAccountMenu();showPage('dashboard')" ${h}>My Dashboard</button>
      <button style="${s}" onclick="closeAccountMenu();showPage('tracking')" ${h}>Track Order</button>
      <button style="${s};color:rgba(231,76,60,.8)" onclick="doLogout()">Sign Out</button>`;
	}
}

function switchDash(tab, el) {
	["overview", "orders", "profile"].forEach((t) => {
		const panel = document.getElementById("dash-" + t);
		if (panel) panel.classList.toggle("hidden", t !== tab);
	});
	document
		.querySelectorAll("#page-dashboard .dn-btn")
		.forEach((b) => b.classList.remove("active"));
	if (el) el.classList.add("active");
}

function renderDashboard() {
	if (!currentUser) {
		showPage("auth");
		return;
	}
	const name = currentUser.firstName || currentUser.name || "";
	const myOrders = orders.filter((o) => o.userId === currentUser.email);
	document.getElementById("dashOverviewContent").innerHTML = `
    <p style="color:var(--grey-lt);margin-bottom:28px">Welcome back, <strong style="color:var(--yellow)">${name}</strong>!</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-bottom:36px">
      <div style="background:var(--dark-2);padding:24px;border-top:2px solid var(--yellow)">
        <p style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--grey-lt);margin-bottom:8px">Total Orders</p>
        <p style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--white)">${myOrders.length}</p>
      </div>
      <div style="background:var(--dark-2);padding:24px;border-top:2px solid rgba(245,196,0,.4)">
        <p style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--grey-lt);margin-bottom:8px">Total Spent</p>
        <p style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--white)">₱${myOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}</p>
      </div>
      <div style="background:var(--dark-2);padding:24px;border-top:2px solid rgba(245,196,0,.2)">
        <p style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--grey-lt);margin-bottom:8px">Cart Items</p>
        <p style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--white)">${cart.reduce((s, c) => s + c.qty, 0)}</p>
      </div>
    </div>`;
	document.getElementById("dashOrdersContent").innerHTML = myOrders.length
		? `
    <div class="tbl-wrap"><table class="data-table">
      <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${myOrders
				.map(
					(o) => `
        <tr>
          <td style="font-family:'Syne',sans-serif;color:var(--yellow);font-weight:700">${o.id}</td>
          <td>${o.date}</td>
          <td>${o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
          <td>₱${o.total.toLocaleString()}</td>
          <td><span class="status-badge st-${o.status.toLowerCase()}">${o.status}</span></td>
          <td><button class="btn-dark btn-sm" onclick="prefillTrack('${o.id}')">Track</button></td>
        </tr>`,
				)
				.join("")}
      </tbody>
    </table></div>`
		: `<p style="color:var(--grey-lt);font-style:italic">No orders yet. <a href="#" onclick="showPage('shop')" style="color:var(--yellow)">Start shopping →</a></p>`;
	document.getElementById("dashProfileContent").innerHTML = `
    <div style="max-width:480px;display:flex;flex-direction:column;gap:16px">
      <div class="fg"><label>First Name</label><input type="text" value="${currentUser.firstName || ""}" id="pf-first"/></div>
      <div class="fg"><label>Last Name</label><input type="text" value="${currentUser.lastName || ""}" id="pf-last"/></div>
      <div class="fg"><label>Email</label><input type="email" value="${currentUser.email || ""}" id="pf-email" readonly style="background:var(--dark-2);opacity:.6"/></div>
      <div class="fg"><label>Phone</label><input type="text" value="${currentUser.phone || ""}" id="pf-phone"/></div>
      <div class="fg"><label>Address</label><input type="text" value="${currentUser.addr || ""}" id="pf-addr"/></div>
      <button class="btn-primary" onclick="saveProfile()">Save Changes</button>
    </div>`;
}

function saveProfile() {
	currentUser.firstName = document.getElementById("pf-first").value;
	currentUser.lastName = document.getElementById("pf-last").value;
	currentUser.phone = document.getElementById("pf-phone").value;
	currentUser.addr = document.getElementById("pf-addr").value;
	const idx = registeredUsers.findIndex((u) => u.email === currentUser.email);
	if (idx > -1) {
		registeredUsers[idx] = { ...registeredUsers[idx], ...currentUser };
		localStorage.setItem("hc_regusers", JSON.stringify(registeredUsers));
	}
	localStorage.setItem("hc_user", JSON.stringify(currentUser));
	prefillCheckout();
	showToast("Profile updated!");
}

function prefillTrack(id) {
	document.getElementById("trackInput").value = id;
	showPage("tracking");
	setTimeout(trackOrder, 200);
}

function switchAdmin(tab, el) {
	document
		.querySelectorAll(".admin-panel")
		.forEach((p) => p.classList.add("hidden"));
	document.getElementById("admin-" + tab)?.classList.remove("hidden");
	document
		.querySelectorAll("#page-admin .dn-btn")
		.forEach((b) => b.classList.remove("active"));
	if (el) el.classList.add("active");
	if (tab === "overview") renderAdminOverview();
	if (tab === "orders") renderAdminOrders();
	if (tab === "inventory") renderAdminInventory();
	if (tab === "users") renderAdminUsers();
	if (tab === "reports") renderAdminReports();
}

function renderAdmin() {
	renderAdminOverview();
}

function renderAdminOverview() {
	const totalRev = orders.reduce((s, o) => s + o.total, 0);
	const allU = [
		...ACCOUNTS.filter((a) => a.role !== "admin"),
		...registeredUsers,
	];
	document.getElementById("adminOverviewContent").innerHTML = `
    <div class="admin-stats">
      <div class="stat-card"><p class="stat-label">Total Revenue</p><p class="stat-val">₱${totalRev.toLocaleString()}</p><p class="stat-ch pos">All time</p></div>
      <div class="stat-card"><p class="stat-label">Total Orders</p><p class="stat-val">${orders.length}</p><p class="stat-ch">All orders</p></div>
      <div class="stat-card"><p class="stat-label">Products</p><p class="stat-val">${products.length}</p><p class="stat-ch">Active listings</p></div>
      <div class="stat-card"><p class="stat-label">Customers</p><p class="stat-val">${allU.length}</p><p class="stat-ch">Registered</p></div>
    </div>
    <h3>Recent Orders</h3>
    <div class="tbl-wrap"><table class="data-table">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
      <tbody>${orders
				.slice(-5)
				.reverse()
				.map(
					(o) => `
        <tr>
          <td style="font-family:'Syne',sans-serif;color:var(--yellow);font-weight:700;white-space:nowrap">${o.id}</td>
          <td style="color:var(--white);font-weight:600">${o.userName}</td>
          <td>${o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
          <td>₱${o.total.toLocaleString()}</td>
          <td style="text-transform:capitalize">${o.payment || "gcash"}</td>
          <td>${o.date}</td>
          <td><span class="status-badge st-${o.status.toLowerCase()}">${o.status}</span></td>
          <td><select onchange="updateOrderStatus('${o.id}',this.value)" style="padding:5px 10px;font-size:.72rem;border:1px solid var(--border-2);border-radius:var(--r);background:var(--dark-3);color:var(--white);outline:none">
            <option ${o.status === "Processing" ? "selected" : ""}>Processing</option>
            <option ${o.status === "Packing" ? "selected" : ""}>Packing</option>
            <option ${o.status === "Shipped" ? "selected" : ""}>Shipped</option>
            <option ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
          </select></td>
        </tr>`,
				)
				.join("")}
      </tbody>
    </table></div>`;
}

function renderAdminOrders() {
	document.getElementById("adminOrdersContent").innerHTML = orders.length
		? `
    <div class="tbl-wrap"><table class="data-table">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Email</th><th>Phone</th><th>Address</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
      <tbody>${orders
				.map(
					(o) => `
        <tr>
          <td style="font-family:'Syne',sans-serif;color:var(--yellow);font-weight:700;white-space:nowrap">${o.id}</td>
          <td style="color:var(--white);font-weight:600">${o.userName}</td>
          <td>${o.userEmail || "—"}</td><td>${o.userPhone || "—"}</td><td>${o.userAddr || "—"}</td>
          <td>${o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
          <td>₱${o.total.toLocaleString()}</td>
          <td style="text-transform:capitalize">${o.payment || "gcash"}</td>
          <td>${o.date}</td>
          <td><span class="status-badge st-${o.status.toLowerCase()}">${o.status}</span></td>
          <td><select onchange="updateOrderStatus('${o.id}',this.value)" style="padding:5px 10px;font-size:.72rem;border:1px solid var(--border-2);border-radius:var(--r);background:var(--dark-3);color:var(--white);outline:none">
            <option ${o.status === "Processing" ? "selected" : ""}>Processing</option>
            <option ${o.status === "Packing" ? "selected" : ""}>Packing</option>
            <option ${o.status === "Shipped" ? "selected" : ""}>Shipped</option>
            <option ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
          </select></td>
        </tr>`,
				)
				.join("")}
      </tbody>
    </table></div>`
		: `<p style="color:var(--grey-lt);font-style:italic">No orders yet.</p>`;
}

function updateOrderStatus(id, status) {
	const o = orders.find((x) => x.id === id);
	if (!o) return;
	o.status = status;
	localStorage.setItem("hc_orders", JSON.stringify(orders));
	showToast(`Order ${id} → ${status}`);
}

function renderAdminInventory() {
	document.getElementById("adminInventoryContent").innerHTML = `
    <div class="tbl-wrap"><table class="data-table">
      <thead><tr><th>Product</th><th>Category</th><th>Material</th><th>Size</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
      <tbody>${products
				.map((p) => {
					const sc =
						p.stock === 0
							? "#e74c3c"
							: p.stock <= 5
								? "#f39c12"
								: "var(--yellow)";
					const sl =
						p.stock === 0
							? "Out of Stock"
							: p.stock <= 5
								? "Low Stock"
								: "In Stock";
					return `<tr>
          <td style="color:var(--white);font-weight:600">${p.name}</td>
          <td>${p.cat}</td><td>${p.material}</td><td>${p.size}</td>
          <td>₱${p.price.toLocaleString()}</td>
          <td style="color:${sc};font-weight:700">${p.stock} units</td>
          <td><span class="status-badge" style="background:rgba(245,196,0,.08);color:${sc}">${sl}</span></td>
        </tr>`;
				})
				.join("")}
      </tbody>
    </table></div>`;
}

function renderAdminUsers() {
	const allU = [
		...ACCOUNTS.filter((a) => a.role !== "admin"),
		...registeredUsers,
	];
	document.getElementById("adminUsersContent").innerHTML = `
    <div class="tbl-wrap"><table class="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Orders</th><th>Total Spent</th></tr></thead>
      <tbody>${allU
				.map((u) => {
					const uOrders = orders.filter((o) => o.userId === u.email);
					const spent = uOrders.reduce((s, o) => s + o.total, 0);
					const name = u.firstName
						? `${u.firstName} ${u.lastName}`
						: u.name || u.email;
					return `<tr>
          <td style="color:var(--white);font-weight:600">${name}</td>
          <td>${u.email}</td><td>${u.phone || "—"}</td><td>${u.addr || "—"}</td>
          <td>${uOrders.length}</td><td>₱${spent.toLocaleString()}</td>
        </tr>`;
				})
				.join("")}
      </tbody>
    </table></div>`;
}

function renderAdminReports() {
	const totalRev = orders.reduce((s, o) => s + o.total, 0);
	const topProd = [...products].sort((a, b) => {
		const sa = orders.reduce(
			(s, o) =>
				s + o.items.filter((i) => i.id === a.id).reduce((x, i) => x + i.qty, 0),
			0,
		);
		const sb = orders.reduce(
			(s, o) =>
				s + o.items.filter((i) => i.id === b.id).reduce((x, i) => x + i.qty, 0),
			0,
		);
		return sb - sa;
	});
	document.getElementById("adminReportsContent").innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:2px;margin-bottom:36px">
      <div style="background:var(--dark-2);padding:28px;border-top:2px solid var(--yellow)"><p style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--grey-lt);margin-bottom:8px">Total Revenue</p><p style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--white)">₱${totalRev.toLocaleString()}</p></div>
      <div style="background:var(--dark-2);padding:28px;border-top:2px solid rgba(245,196,0,.4)"><p style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--grey-lt);margin-bottom:8px">Avg Order Value</p><p style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--white)">₱${orders.length ? Math.round(totalRev / orders.length).toLocaleString() : 0}</p></div>
    </div>
    <h3>Product Performance</h3>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
      ${topProd
				.map((p) => {
					const sold = orders.reduce(
						(s, o) =>
							s +
							o.items
								.filter((i) => i.id === p.id)
								.reduce((x, i) => x + i.qty, 0),
						0,
					);
					const topSold = orders.reduce(
						(s, o) =>
							s +
							o.items
								.filter((i) => i.id === topProd[0]?.id)
								.reduce((x, i) => x + i.qty, 0),
						0,
					);
					const pct = topSold
						? Math.round((sold / Math.max(1, topSold)) * 100)
						: 0;
					return `<div style="display:flex;align-items:center;gap:14px">
          <span style="min-width:200px;font-size:.84rem;color:rgba(59, 43, 4, 0.7);font-weight:500">${p.name}</span>
          <div style="flex:1;height:24px;background:var(--dark-3);border-radius:var(--r);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:var(--yellow);display:flex;align-items:center;padding:0 10px;font-size:.68rem;color:var(--black);font-weight:700;min-width:${sold ? "50px" : "0"}">${sold ? `${sold} sold` : ""}</div>
          </div>
          <span style="font-family:'Syne',sans-serif;font-size:.95rem;font-weight:800;color:var(--yellow);min-width:90px;text-align:right">₱${(sold * p.price).toLocaleString()}</span>
        </div>`;
				})
				.join("")}
    </div>`;
}

function setRating(n) {
	currentRating = n;
	document
		.querySelectorAll(".star")
		.forEach((s, i) => s.classList.toggle("lit", i < n));
}

function submitReview(e) {
	e.preventDefault();
	if (!currentRating) {
		showToast("Please select a rating.");
		return;
	}
	const rev = {
		name: document.getElementById("revName").value,
		email: document.getElementById("revEmail").value,
		rating: currentRating,
		product: document.getElementById("revProduct").value,
		text: document.getElementById("revText").value,
		date: new Date().toLocaleDateString("en-PH"),
	};
	let saved = JSON.parse(localStorage.getItem("hc_reviews") || "[]");
	saved.unshift(rev);
	localStorage.setItem("hc_reviews", JSON.stringify(saved));
	renderReviewsList();
	e.target.reset();
	currentRating = 0;
	document.querySelectorAll(".star").forEach((s) => s.classList.remove("lit"));
	showToast("Review submitted! Thank you!");
}

function renderReviewsList() {
	const el = document.getElementById("reviewsList");
	if (!el) return;
	const saved = JSON.parse(localStorage.getItem("hc_reviews") || "[]");
	const defaults = [
		{
			name: "Marco R.",
			rating: 5,
			product: "Classic Black Cap",
			text: "Solid quality, great fit. The matte finish is exactly what I needed for my everyday look.",
			date: "Mar 2025",
		},
		{
			name: "Janine P.",
			rating: 5,
			product: "Streetwear Red Snapback",
			text: "The red is SO vibrant in person. Gets compliments every time I wear it. Will buy more!",
			date: "Feb 2025",
		},
		{
			name: "Kevin L.",
			rating: 4,
			product: "Trucker Green Cap",
			text: "Nice breathability on the mesh back. Perfect for outdoor workouts. Great value for money.",
			date: "Jan 2025",
		},
	];
	const list = saved.length ? saved : defaults;
	el.innerHTML = list
		.map(
			(r) => `
    <div class="review-card">
      <div class="rc-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p class="rc-text">"${r.text}"</p>
      <p class="rc-author">${r.name}</p>
      ${r.product ? `<p class="rc-product">${r.product}</p>` : ""}
      <p class="rc-date">${r.date}</p>
    </div>`,
		)
		.join("");
}

function submitContact(e) {
	e.preventDefault();
	showToast("Message sent! We'll reply within 24 hours.");
	e.target.reset();
}

function showToast(msg) {
	const t = document.getElementById("toast");
	t.textContent = msg;
	t.classList.add("show");
	setTimeout(() => t.classList.remove("show"), 3200);
}
