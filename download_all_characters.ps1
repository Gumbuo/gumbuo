# PowerShell script to download all 42 PixelLab characters
$baseDir = "C:\Users\tcmid\gumbuo-site\godot-projects\alien-terrain-game\characters"

# Array of characters with their IDs and names
$characters = @(
    @{Name="Combat-Robot"; ID="475ae3d6-4af2-4443-9f12-5184cd9eb01f"; Timestamp="1763882817434"},
    @{Name="Goblin-Warrior"; ID="cb663675-d060-40e8-9fe8-89c4f169e3e9"; Timestamp="1763882817434"},
    @{Name="Zombie"; ID="1116d8b3-78d9-4de3-a6d6-734698138d16"; Timestamp="1763882817438"},
    @{Name="Giant-Spider"; ID="e44646cf-f350-45df-b409-706f375daab7"; Timestamp="1763882817435"},
    @{Name="Fire-Elemental"; ID="8edea335-eb1a-4ecc-8d6f-83f4ff00f301"; Timestamp="1763882817431"},
    @{Name="Armored-Guard"; ID="4322c1df-e975-4ee2-870f-384e83b2c1ad"; Timestamp="1763906963889"},
    @{Name="Security-Drone"; ID="f6cc9c32-99a6-4e6e-9d67-3b8fa2bfb1d2"; Timestamp="1763906963891"},
    @{Name="Cyborg-Soldier"; ID="fc8fc534-1045-430f-89d6-d6b834d24011"; Timestamp="1763906963891"},
    @{Name="AI-Construct"; ID="f2c323fc-5b28-4ab2-890a-c1273aafd25a"; Timestamp="1763906963889"},
    @{Name="Water-Elemental"; ID="49d57030-ed9c-4b47-98d2-f56c8e6d24a5"; Timestamp="1763906963890"},
    @{Name="Ocean-Elemental"; ID="070cefbb-ac89-4115-aa81-14b968c415e7"; Timestamp="1763906963889"},
    @{Name="Poison-Elemental"; ID="906eded5-9770-44d0-a45a-982b1c59661c"; Timestamp="1763906963889"},
    @{Name="Orc-Brute"; ID="9cd85047-6cfb-444d-8d47-7abb046a1df9"; Timestamp="1763906963889"},
    @{Name="Skeleton-Warrior"; ID="b5e7265c-254c-45cb-89dd-1feb4b02b4a9"; Timestamp="1763906963889"},
    @{Name="Dark-Knight"; ID="965b22e1-5cf4-443f-98d8-53385f27301a"; Timestamp="1763906963891"},
    @{Name="Wind-Elemental"; ID="64d2f3dd-54b0-434d-a7c1-08aed6a88ed7"; Timestamp="1763906963890"},
    @{Name="Magma-Elemental"; ID="48eb59e3-c80e-402e-857d-09516e87934e"; Timestamp="1763906963891"},
    @{Name="Ghost-Specter"; ID="4595e50c-4cf9-4cba-989c-41586d811e5d"; Timestamp="1763906963889"},
    @{Name="Possessed-Creature"; ID="85982812-e1c0-452d-a262-703cddad3299"; Timestamp="1763906963889"},
    @{Name="Shadow-Being"; ID="082189ef-ddd5-45f7-bda0-19d61ef9441e"; Timestamp="1763906963890"},
    @{Name="Tactical-Operative"; ID="108e50ce-54cd-4c3c-ab04-71e8761efda3"; Timestamp="1763906963889"},
    @{Name="Void-Elemental"; ID="898ef75f-e62b-4bb4-a9ca-627ea4e4d823"; Timestamp="1763906963891"},
    @{Name="Metal-Elemental"; ID="d86a48cb-80fd-40a4-a744-9515a43c2136"; Timestamp="1763906963890"},
    @{Name="Nature-Elemental"; ID="16a46bf5-12ea-4b3e-9b18-e014ec4b5918"; Timestamp="1763906963889"},
    @{Name="Mutant-Wolf"; ID="a3f96ad8-3be7-4206-8deb-87b021ffd8a2"; Timestamp="1763906963890"},
    @{Name="Cyber-Bear"; ID="9592bc9f-f131-4c05-92a5-c23535572e04"; Timestamp="1763906963891"},
    @{Name="Alien-Beast"; ID="b62c366f-bc1c-43ab-aaab-e497235d978f"; Timestamp="1763906963889"},
    @{Name="Ice-Golem"; ID="a710d6e3-0d47-4df5-a869-142024103e1d"; Timestamp="1763906963889"},
    @{Name="Lightning-Being"; ID="0008ad39-c705-490b-82a3-a32ebf1aa301"; Timestamp="1763906963890"},
    @{Name="Lava-Creature"; ID="710aaf4d-c460-4792-917d-1553e73155c6"; Timestamp="1763906963891"},
    @{Name="Acid-Elemental"; ID="f2269576-cefe-423b-be1b-7b96db563085"; Timestamp="1763906963889"},
    @{Name="Blood-Elemental"; ID="c9a06b58-ae27-4f8c-94c2-68612dc3469f"; Timestamp="1763906963890"},
    @{Name="Elite-Soldier"; ID="f1c2a2c3-c8cb-458e-8fce-ff6cfd5e33d2"; Timestamp="1763906963890"},
    @{Name="Earth-Elemental"; ID="fcfeaec8-5531-461d-a3f3-85328443d1d4"; Timestamp="1763906963889"},
    @{Name="Sand-Elemental"; ID="0bc67a19-6a81-4a28-84a8-9e542745d3ef"; Timestamp="1763906963891"},
    @{Name="Crystal-Elemental"; ID="a4b68430-7444-4b41-9751-48bbdeb287bf"; Timestamp="1763906963889"},
    @{Name="Plasma-Elemental"; ID="d3fa26d9-c352-4950-abb7-d933831dd193"; Timestamp="1763906963891"},
    @{Name="Storm-Elemental"; ID="29249d17-9c64-4a5c-92c3-1a405dfdebf1"; Timestamp="1763906963889"},
    @{Name="Light-Elemental"; ID="f06031b9-ca9d-4931-9da7-4869b413fd7d"; Timestamp="1763906963890"},
    @{Name="Frost-Elemental"; ID="8fcc31d9-268e-4235-a9ad-0b5e0e1f3533"; Timestamp="1763906963890"},
    @{Name="Smoke-Elemental"; ID="e07805e0-7110-4489-992e-9879ecfca3fd"; Timestamp="1763906963889"},
    @{Name="Steam-Elemental"; ID="f89e1497-b450-43bd-9db1-9ff1f3ccf754"; Timestamp="1763906963891"}
)

$directions = @("south", "west", "east", "north", "south-east", "north-east", "north-west", "south-west")
$baseUrl = "https://backblaze.pixellab.ai/file/pixellab-characters/9cd9cc71-7eeb-4c71-ba67-2153f11b4022"

$count = 0
foreach ($char in $characters) {
    $count++
    Write-Host "[$count/42] Downloading $($char.Name)..." -ForegroundColor Cyan

    # Create character directory
    $charDir = Join-Path $baseDir $char.Name
    $rotDir = Join-Path $charDir "rotations"
    New-Item -ItemType Directory -Force -Path $rotDir | Out-Null

    # Download all 8 directions
    foreach ($dir in $directions) {
        $url = "$baseUrl/$($char.ID)/rotations/$dir.png?t=$($char.Timestamp)"
        $outFile = Join-Path $rotDir "$dir.png"

        try {
            Invoke-WebRequest -Uri $url -OutFile $outFile -ErrorAction Stop
            Write-Host "  - Downloaded $dir.png" -ForegroundColor Green
        }
        catch {
            Write-Host "  - ERROR downloading $dir.png : $_" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Download Complete ===" -ForegroundColor Green
Write-Host "Downloaded $count characters to: $baseDir" -ForegroundColor Green
