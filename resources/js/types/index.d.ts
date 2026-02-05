import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface DashboardDevice {
    id: number;
    identifier: string;
    name: string | null;
    last_latitude: number | null;
    last_longitude: number | null;
    last_recorded_at: string | null;
    status: string;
    last_speed: number | null;
    last_heading: number | null;
}

export interface DashboardVehicle {
    id: number;
    name: string;
    plate: string | null;
    color: string | null;
    device: DashboardDevice | null;
}

export interface HistoryPosition {
    id: number;
    latitude: number;
    longitude: number;
    recorded_at: string;
    speed: number | null;
    heading: number | null;
}

export interface VehicleStats {
    vehicle_id: number;
    vehicle_name: string;
    plate: string | null;
    total_km: number;
    avg_speed_kmh: number | null;
    max_speed_kmh: number | null;
    positions_count: number;
}
