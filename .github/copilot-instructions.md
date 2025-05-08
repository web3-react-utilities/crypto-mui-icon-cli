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
