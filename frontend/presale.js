const presaleAddress = "0x102078D1b5222562d76E63414c764fC7deedA4E0";
let presaleABI = [];

window.onload = async () => {
  await loadABI();
  await updateProgress();
  await loadLeaderboard();
};

async function loadABI() {
  try {
    const res = await fetch("abi.json");
    presaleABI = await res.json();
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
    await connectWallet();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const tx = await signer.sendTransaction({
      to: presaleAddress,
      value: ethers.utils.parseEther(amountInEth)
    });

    await tx.wait();
    alert("✅ GMB purchased!");
    await updateProgress();
    await loadLeaderboard();
  } catch (err) {
    console.error("❌ Transaction failed:", err);
    alert("Transaction failed. Check console for details.");
  }
}

async function updateProgress() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const presale = new ethers.Contract(presaleAddress, presaleABI, provider);
    const sold = await presale.totalSold();
    const progressText = `${sold.toString()} / 350,000,000 GMB sold`;
    document.getElementById("progressBar").innerText = progressText;
  } catch (err) {
    console.error("❌ Failed to fetch presale progress:", err);
    document.getElementById("progressBar").innerText = "Error loading progress";
  }
}

async function loadLeaderboard() {
  try {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();

    const list = document.getElementById("topBuyers");
    list.innerHTML = "";

    data.forEach(({ wallet, total }) => {
      const li = document.createElement("li");
      li.textContent = `${wallet.slice(0, 6)}...${wallet.slice(-4)} — ${total} ETH`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Failed to load leaderboard:", err);
  }
}
