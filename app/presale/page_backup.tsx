"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers, BigNumber } from "ethers";
import GumbuoPresaleABI from "../../abis/GumbuoPresale.json";
import { handleBuy } from "./handleBuy";
import BuyButton from "./BuyButton";
