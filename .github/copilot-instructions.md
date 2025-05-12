<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Crypto Icon CLI

Đây là dự án CLI cho việc quản lý và thêm các crypto token icon vào dự án React.

## Hướng dẫn cho Copilot

-   Khi làm việc với file trong thư mục `templates`, hãy đảm bảo rằng các placeholder như `{{TOKEN_NAME}}`, `{{WALLET_NAME}}`, và `{{SYSTEM_NAME}}` được giữ nguyên vì chúng sẽ được thay thế bởi CLI tool.
-   Khi thêm các enum trong `types/index.ts`, hãy tuân theo format hiện tại và sắp xếp theo thứ tự alphabetical.
-   Khi làm việc với các file helper trong `utils/`, hãy đảm bảo chúng xử lý lỗi một cách phù hợp và log thông tin hữu ích cho người dùng.
-   Trong file README.md, phần hướng dẫn cài đặt package chỉ nên hướng dẫn cách sử dụng bằng lệnh `npx` kèm với `@latest` trong mọi ví dụ câu lệnh, không nên đề xuất cài đặt toàn cục hoặc cục bộ.
-   Khi làm việc với các loại type nên dùng khai báo "type" không dùng "interface".
-   Khi được yêu cầu thêm "token đặc biệt" (ví dụ: "thêm token đặc biệt A, B, C"), hãy tự động thêm vào mảng `specialTokens` trong file `utils/specialIcons.ts` để các token này sẽ sử dụng hậu tố `-lightmode` và `-darkmode` cho các ảnh tương ứng.
-   Tương tự, khi được yêu cầu thêm "wallet đặc biệt" hoặc "system đặc biệt", hãy tự động thêm vào mảng tương ứng `specialWallets` hoặc `specialSystems` trong file `utils/specialIcons.ts`.
-   Khi cập nhật hoặc tạo mới danh sách tokens, wallets, hoặc systems trong các file tài liệu (TOKENS.md, WALLETS.md, SYSTEMS.md), hãy tuân theo mẫu định dạng bảng dưới đây:
    ```markdown
    |       |       |       |        |        |        |
    | :---: | :---: | :---: | :----: | :----: | :----: |
    | Item1 | Item2 | Item3 | Item4  | Item5  | Item6  |
    | Item7 | Item8 | Item9 | Item10 | Item11 | Item12 |
    ```
-   Khi thêm mới các token, wallet, hoặc system vào danh sách, luôn đảm bảo rằng danh sách cuối cùng được sắp xếp theo thứ tự alphabet (A-Z).
-   Luôn dùng định dạng bảng với 6 cột trong các file tài liệu để hiển thị danh sách tokens, wallets và systems để đảm bảo sự nhất quán và dễ đọc.
-   Khi thêm key token vào file README.md hoặc các file tài liệu khác, luôn giữ định dạng bảng giống như các file hiện có và đảm bảo các key token được sắp xếp theo thứ tự alphét từ A đến Z.
-   Khi người dùng yêu cầu "thêm key token [TÊN TOKEN]", "thêm key system [TÊN SYSTEM]", hoặc "thêm key wallet [TÊN WALLET]":
    1. Cập nhật file tương ứng (TOKENS.md, SYSTEMS.md, hoặc WALLETS.md)
    2. Thêm key mới theo đúng vị trí alphabet trong bảng 6 cột hiện có
    3. Giữ nguyên định dạng bảng hiện tại, chỉ thay đổi nội dung
    4. Sau khi cập nhật, kiểm tra lại xem bảng có cân đối không (mỗi hàng đủ 6 cột)
-   **Quan trọng**: Khi cập nhật token/system/wallet, luôn đảm bảo cập nhật đồng thời cả hai nơi:
    1. Cập nhật file tài liệu tương ứng (TOKENS.md, SYSTEMS.md, WALLETS.md) với danh sách mới
    2. Cập nhật mảng tương ứng trong file `src/utils/specialIcons.ts` (`specialTokens`, `specialSystems`, `specialWallets`) nếu token/system/wallet có phiên bản light/dark mode
    3. Việc cập nhật cả hai nơi giúp đảm bảo tính nhất quán giữa tài liệu và mã nguồn
    4. Nếu một token/system/wallet có cả hai file ảnh với hậu tố `-lightmode` và `-darkmode`, thì đó là token/system/wallet đặc biệt và cần được thêm vào mảng tương ứng trong `specialIcons.ts`

## Thông tin về thư mục scripts

Thư mục `scripts` chứa các scripts hỗ trợ không được commit vào repository. Dưới đây là thông tin về các scripts quan trọng và cách tái tạo khi cần:

### copy-templates.js

Script này chạy sau khi build để sao chép các template files vào thư mục dist:

```javascript
const fs = require("fs-extra");
const path = require("path");

// Đường dẫn
const srcTemplatesDir = path.join(__dirname, "..", "src", "templates");
const distTemplatesDir = path.join(__dirname, "..", "dist", "templates");

// Sao chép templates
async function copyTemplates() {
    try {
        await fs.copy(srcTemplatesDir, distTemplatesDir);
        console.log("Templates copied successfully to dist folder");
    } catch (err) {
        console.error("Error copying templates:", err);
        process.exit(1);
    }
}

copyTemplates();
```

### firebase-token-list.js

Script để lấy danh sách tokens từ Firebase Storage và cập nhật vào TOKENS.md:

```javascript
const admin = require("firebase-admin");
const fs = require("fs-extra");
const path = require("path");

// Kết nối Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, "..", "crypto-images-4545f-firebase-adminsdk-fbsvc-4e7b983716.json");
const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "crypto-images-token", // Token bucket name
});

// Functions to extract token names, check for special tokens, and update markdown
function extractTokenName(filePath) {
    const fileName = path.basename(filePath);
    
    // Support mixed-case token names with possible dashes (e.g., "stOSMO-lightmode.png", "UST-WORMHOLE-darkmode.png")
    const lightDarkModeMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)-(?:lightmode|darkmode)\.png$/);
    if (lightDarkModeMatch) return lightDarkModeMatch[1];

    // Support mixed-case token names with possible dashes (e.g., "stOSMO.png", "UST-WORMHOLE.png")  
    const regularTokenMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)\.png$/);
    if (regularTokenMatch) return regularTokenMatch[1];

    return null;
}

// Script tự động phân tích tokens trong Firebase Storage và cập nhật cả hai nơi:
// 1. Cập nhật TOKENS.md với danh sách token trong bảng 6 cột
// 2. Cập nhật mảng specialTokens trong file src/utils/specialIcons.ts với các token có phiên bản light/dark mode

// Hàm kiểm tra xem token có phiên bản light/dark mode không
function hasLightDarkModeVariants(tokenName, allFileNames) {
    // Escape special characters in token name for regex pattern matching
    const escapedTokenName = tokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    const lightModePattern = new RegExp(`^${escapedTokenName}-lightmode\\.png$`, "i");
    const darkModePattern = new RegExp(`^${escapedTokenName}-darkmode\\.png$`, "i");

    return allFileNames.some(name => lightModePattern.test(name)) && 
           allFileNames.some(name => darkModePattern.test(name));
}
```

Script tương tự cũng được tạo cho systems (`firebase-system-list.js`) và wallets (`firebase-wallet-list.js`) để đồng bộ dữ liệu từ Firebase Storage buckets tương ứng (`crypto-images-system` và `crypto-images-wallet`).

```javascript
// System extraction pattern (supporting mixed case and dashes in names)
function extractSystemName(filePath) {
    const fileName = path.basename(filePath);
    
    // Support for system names with dashes (e.g., "Terra-Classic-lightmode.png")
    const lightDarkModeMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)-(?:lightmode|darkmode)\.png$/);
    if (lightDarkModeMatch) return lightDarkModeMatch[1];

    // Support for system names with dashes (e.g., "Terra-Classic.png")
    const regularSystemMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)\.png$/);
    if (regularSystemMatch) return regularSystemMatch[1];

    return null;
}

// Wallet extraction pattern (supporting mixed case and dashes in names)
function extractWalletName(filePath) {
    const fileName = path.basename(filePath);
    
    // Support for wallet names with dashes (e.g., "Trust-Wallet-lightmode.png")
    const lightDarkModeMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)-(?:lightmode|darkmode)\.png$/);
    if (lightDarkModeMatch) return lightDarkModeMatch[1];

    // Support for wallet names with dashes (e.g., "Trust-Wallet.png")
    const regularWalletMatch = fileName.match(/^([a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)\.png$/);
    if (regularWalletMatch) return regularWalletMatch[1];

    return null;
}
```

Lưu ý rằng thư mục `scripts` đã được thêm vào `.gitignore` và sẽ không được commit. Khi cần, có thể tái tạo các scripts này dựa trên hướng dẫn trên.

### Cách sử dụng scripts Firebase

Các scripts Firebase được thiết kế để tự động hóa quy trình cập nhật danh sách tokens, systems và wallets:

1. Các scripts sẽ kết nối đến Firebase Storage sử dụng service account
2. Lấy danh sách tất cả các file ảnh và phân tích tên file để trích xuất tên token/system/wallet
3. Tự động xác định các token/system/wallet đặc biệt có phiên bản lightmode/darkmode
4. Cập nhật file tài liệu tương ứng (TOKENS.md, SYSTEMS.md, WALLETS.md) với bảng 6 cột
5. Cập nhật mảng tương ứng trong file specialIcons.ts

Để chạy scripts (ví dụ):
```bash
node scripts/firebase-token-list.js  # Cập nhật danh sách tokens
node scripts/firebase-system-list.js # Cập nhật danh sách systems
node scripts/firebase-wallet-list.js # Cập nhật danh sách wallets
```

### Quy ước đặt tên file ảnh

Các file ảnh trong Firebase Storage tuân theo quy ước đặt tên sau:

1. **File ảnh thông thường**: `[TÊN].png` - ví dụ: `BTC.png`, `MetaMask.png`, `Ethereum.png`
2. **File ảnh cho light mode**: `[TÊN]-lightmode.png` - ví dụ: `BTC-lightmode.png`
3. **File ảnh cho dark mode**: `[TÊN]-darkmode.png` - ví dụ: `BTC-darkmode.png`

Với `[TÊN]` có thể chứa:
- Các chữ cái viết hoa và viết thường (a-z, A-Z)
- Các chữ số (0-9)
- Dấu gạch ngang (-) để ngăn cách các từ trong tên (ví dụ: `UST-WORMHOLE`, `Terra-Classic`, `Trust-Wallet`)
