 // ✅ Step 1: Import Firebase Modules
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
        import { getDatabase, ref, set, push, onValue, get, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

        // ✅ Step 2: Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyB-9uYvVQ6GfPTQK-2aHu27QwcuCwSxacM",
            authDomain: "auction-db7e5.firebaseapp.com",
            databaseURL: "https://auction-db7e5-default-rtdb.firebaseio.com",
            projectId: "auction-db7e5",
            storageBucket: "auction-db7e5.firebasestorage.app",
            messagingSenderId: "996699605695",
            appId: "1:996699605695:web:4a78873aeba59f45ca140a",
            measurementId: "G-C57C624WGS"
        };

        // ✅ Step 3: Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const auctionRef = ref(db, "auctions");

        // Player variables
        let playerId = "Player-" + Math.floor(Math.random() * 10000);
        let playerName = "";
        let isAdmin = false; // Track if the user is an admin
        let auctionActive = true; // Track if the auction is active
        let shoptotalMoney = totalMoney; // Initial total shop money

        // ✅ Step 5: Set Player Name
        window.setName = function () {
            playerName = document.getElementById("playerName").value.trim();
            if (playerName === "") {
                alert("Please enter your name!");
                return;
            }
            document.getElementById("playerId").innerText = playerName + " (" + playerId + ")";
            document.getElementById("shop-total-money").innerText = shoptotalMoney; // Display initial money
            alert("Name set successfully!");
        };

        // ✅ Step 6: Load Auction Items in Real-Time
function loadAuctions() {
    onValue(auctionRef, (snapshot) => {
        const data = snapshot.val();
        const auctionList = document.getElementById("auctionList");
        auctionList.innerHTML = "";

        if (data) {
            Object.keys(data).forEach((itemId) => {
                const item = data[itemId];
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("auction-item");
                itemDiv.innerHTML = `
                    <h3>${item.itemName} 🏆</h3>
                    <p><strong>Highest Bid:</strong> $${item.highestBid}</p>
                    <p><strong>Current Owner:</strong> ${item.owner || "None"}</p>
                    <input type="number" id="bid_${itemId}" placeholder="Enter bid" ${!auctionActive ? 'disabled' : ''}>
                    <button onclick="placeBid('${itemId}')" ${!auctionActive ? 'disabled' : ''}>Bid</button>
                    <!-- Remove Item button has been removed -->
                `;
                auctionList.appendChild(itemDiv);
            });
        }
        displayRemoveButtons();
    });
}
        loadAuctions(); // Load items at start

        // ✅ Step 7: Place a Bid on a Specific Item
        window.placeBid = async function (itemId) {
            const bidInput = document.getElementById("bid_" + itemId);
            const bid = parseFloat(bidInput.value);

            if (isNaN(bid) || bid <= 0) {
                alert("Enter a valid bid amount!");
                return;
            }
            if (playerName === "") {
                alert("Please set your name before bidding!");
                return;
            }
            if (bid > shoptotalMoney) {
                alert("You do not have enough money to place this bid!");
                return;
            }

            // Get the current highest bid for the item
            const snapshot = await get(ref(db, `auctions/${itemId}`));
            const item = snapshot.val();

            if (bid > item.highestBid) {
                shoptotalMoney -= bid; // Deduct the bid amount from total shop money
                document.getElementById("shop-total-money").innerText = shoptotalMoney; // Update displayed money
                set(ref(db, `auctions/${itemId}`), {
                    itemName: item.itemName,
                    owner: playerName,
                    highestBid: bid
                });
            } else {
                alert("Your bid must be higher than the current highest bid!");
            }
        };

        // ✅ Step 8: Remove Auction Item (Admin Only)
        window.removeItem = async function (itemId) {
            await remove(ref(db, `auctions/${itemId}`));
            alert("Item removed successfully!");
        };

        // ✅ Step 9: Secure Admin Section
        const adminPassword = "admin123"; // 🔒 Change this to a secure password
        window.showAdminPanel = function () {
            const inputPassword = prompt("Enter admin password:");
            if (inputPassword === adminPassword) {
                isAdmin = true; // Set admin flag
                document.getElementById("adminSection").style.display = "block";
                loadAuctions(); // Reload auctions to show remove buttons
            } else {
                alert("Incorrect password!");
            }
        };

        // Show remove buttons for auction items if admin
        function displayRemoveButtons() {
            if (isAdmin) {
                document.querySelectorAll(".remove-item").forEach(button => {
                    button.style.display = "inline"; // Show remove buttons
                });
            }
        }

        // ✅ Step 10: Add New Auction Item (Admin Only)
        window.addNewItem = function () {
            const newItem = document.getElementById("newItemName").value.trim();
            const startingBid = parseFloat(document.getElementById("startingBid").value);

            if (newItem === "" || isNaN(startingBid) || startingBid < 0) {
                alert("Enter valid item name and starting bid!");
                return;
            }

            const newItemRef = push(auctionRef);
            set(newItemRef, { itemName: newItem, owner: "None", highestBid: startingBid });

            alert("New auction item added!");
            loadAuctions(); // Reload auctions after adding new item
        };

        // ✅ Step 11: Start Auction with Timer (Admin Only)
        window.startAuction = function () {
            const duration = parseInt(document.getElementById("auctionDuration").value);
            if (isNaN(duration) || duration <= 0) {
                alert("Enter a valid duration in minutes!");
                return;
            }

            auctionActive = true; // Set auction status to active
            alert("Auction started! Duration: " + duration + " minutes.");
            setTimeout(stopAuction, duration * 60000); // Automatically stop auction after duration
        };

        // ✅ Step 12: Stop Auction (Admin Only)
        window.stopAuction = function () {
            auctionActive = false; // Set auction status to inactive
            alert("Auction has been stopped.");
            loadAuctions(); // Reload auctions to disable bidding
        };
