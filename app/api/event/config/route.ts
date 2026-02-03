import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "../../lib/points";

const EVENT_CONFIG_KEY = "gumbuo:event:config";

// Admin wallet addresses (must match admin page)
const ADMIN_WALLETS = [
  "0xb374735cbe89a552421ddb4aad80380ae40f67a7",
];

export interface EventConfig {
  isActive: boolean;
  startDate: string | null; // ISO date string
  endDate: string | null; // ISO date string
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  activatedBy: string | null;
}

const DEFAULT_CONFIG: EventConfig = {
  isActive: false,
  startDate: null,
  endDate: null,
  name: "Testing Event",
  description: "Earn shares by completing milestones and split the ETH reward pool!",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activatedBy: null,
};

// GET /api/event/config - Get event configuration (public)
export async function GET() {
  try {
    const redis = getRedis();
    const config = await redis.get<EventConfig>(EVENT_CONFIG_KEY);

    if (!config) {
      return NextResponse.json({
        success: true,
        config: DEFAULT_CONFIG,
      });
    }

    // Calculate event status
    const now = new Date();
    let status: "upcoming" | "live" | "ended" | "inactive" = "inactive";

    if (config.isActive) {
      if (config.startDate && config.endDate) {
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);

        if (now < start) {
          status = "upcoming";
        } else if (now >= start && now <= end) {
          status = "live";
        } else {
          status = "ended";
        }
      } else {
        // Active but no dates set - treat as live
        status = "live";
      }
    }

    return NextResponse.json({
      success: true,
      config,
      status,
      serverTime: now.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching event config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event config" },
      { status: 500 }
    );
  }
}

// POST /api/event/config - Update event configuration (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminWallet, ...updates } = body;

    // Verify admin access
    if (!adminWallet || !ADMIN_WALLETS.includes(adminWallet.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const redis = getRedis();
    const currentConfig = await redis.get<EventConfig>(EVENT_CONFIG_KEY) || DEFAULT_CONFIG;

    // Apply updates
    const newConfig: EventConfig = {
      ...currentConfig,
      ...updates,
      updatedAt: Date.now(),
    };

    // If activating, record who activated it
    if (updates.isActive && !currentConfig.isActive) {
      newConfig.activatedBy = adminWallet.toLowerCase();
    }

    await redis.set(EVENT_CONFIG_KEY, newConfig);

    return NextResponse.json({
      success: true,
      config: newConfig,
      message: updates.isActive !== undefined
        ? (updates.isActive ? "Event activated!" : "Event deactivated")
        : "Config updated",
    });
  } catch (error) {
    console.error("Error updating event config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event config" },
      { status: 500 }
    );
  }
}
