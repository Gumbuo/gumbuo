const presaleAddress = "0x102078D1b5222562d76E63414c764fC7deedA4E0";
let presaleABI = [];

async function loadABI() {
  try {
    const res = await fetch("abi.json");
    presaleABI = await res.json();
    updateProgress();
  } catch (err) {
    console.error("❌ Failed to load ABI:", err);
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
}

async function buyGMB() {
  const amountInEth = document.getElementById("ethAmount").value;
  if (!amountInEth || isNaN(amountInEth)) {
    alert("Enter a valid ETH amount");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await signer.sendTransaction({
      to: presaleAddress,
      value: ethers.utils.parseEther(amountInEth)
    });

    await tx.wait();
    alert("✅ GMB purchased!");
    updateProgress();
  } catch (err) {
    console.error("❌ Transaction failed:", err);
    alert("Transaction failed. Check console for details.");
  }
}

async function loadLeaderboard() {
  const res = await fetch("/api/leaderboard");
  const data = await res.json();

  const list = document.getElementById("topBuyers");
  list.innerHTML = "";

  data.forEach(({ wallet, total }) => {
    const li = document.createElement("li");
    li.textContent = `${wallet.slice(0, 6)}...${wallet.slice(-4)} — ${total} ETH`;
    list.appendChild(li);
  });
}

async function updateProgress() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const presale = new ethers.Contract(presaleAddress, presaleABI, provider);
    const sold = await presale.totalSold(); // assumes this exists
    document.getElementById("progressBar").innerText = `${sold.toString()} / 350000000 GMB sold`;
  } catch (err) {
    console.error("❌ Failed to fetch presale progress:", err);
    document.getElementById("progressBar").innerText = "Error loading progress";
  }
}

window.onload = loadABI;
