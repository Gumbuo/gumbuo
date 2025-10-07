$logPath = "$env:USERPROFILE\gumbuo-site\leaderboard.json"
$htmlPath = "$env:USERPROFILE\gumbuo-site\leaderboard.html"

$header = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gumbuo Leaderboard</title>
  <style>
    body { font-family: sans-serif; background: #0f0f0f; color: #fff; padding: 2rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.5rem; border-bottom: 1px solid #333; text-align: left; }
    th { background: #222; }
    tr:hover { background: #1a1a1a; }
  </style>
</head>
<body>
  <h1>?? Gumbuo Leaderboard</h1>
  <table>
    <thead>
      <tr>
        <th>Wallet</th>
        <th>ETH Sent</th>
        <th>Gas Fee</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
