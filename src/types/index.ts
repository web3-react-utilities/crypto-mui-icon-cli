export type AddCommandOptions = {
    token?: string[];
    wallet?: string[];
    system?: string[];
    dir?: string;
};

export type RemoveCommandOptions = {
    token?: string[];
    wallet?: string[];
    system?: string[];
    dir?: string;
};

export type ExportOptions = {
    tokens: string[];
    wallets: string[];
    systems: string[];
};

export type IconUrls = {
    lightmode: string;
    darkmode: string;
};

// We only need to export the enum values, which include the types automatically
export { TokenName } from "./TokenName";
export { WalletName } from "./WalletName";
export { SystemName } from "./SystemName";
