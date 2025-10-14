const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Hàm để hỏi người dùng
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Hàm để thực thi lệnh và hiển thị output
function execCommand(command, options = {}) {
    try {
        console.log(`🔧 Executing: ${command}`);
        const result = execSync(command, { 
            stdio: 'inherit', 
            encoding: 'utf8',
            ...options 
        });
        return result;
    } catch (error) {
        console.error(`❌ Error executing command: ${command}`);
        console.error(error.message);
        throw error;
    }
}

// Hàm chính
async function deploy() {
    console.log('🚀 Bắt đầu deploy Create-Image-Studio lên Cloudflare Pages...\n');

    try {
        // Kiểm tra wrangler đã được cài đặt chưa
        console.log('📋 Kiểm tra Wrangler CLI...');
        try {
            execCommand('wrangler --version', { stdio: 'pipe' });
            console.log('✅ Wrangler CLI đã được cài đặt\n');
        } catch (error) {
            console.log('❌ Wrangler CLI chưa được cài đặt');
            console.log('📦 Đang cài đặt Wrangler CLI...');
            execCommand('npm install -g wrangler');
            console.log('✅ Wrangler CLI đã được cài đặt thành công\n');
        }

        // Kiểm tra đăng nhập
        console.log('🔐 Kiểm tra đăng nhập Cloudflare...');
        try {
            execCommand('wrangler whoami', { stdio: 'pipe' });
            console.log('✅ Đã đăng nhập vào Cloudflare\n');
        } catch (error) {
            console.log('❌ Bạn chưa đăng nhập vào Cloudflare');
            console.log('🔗 Vui lòng đăng nhập:');
            execCommand('wrangler login');
            console.log('✅ Đăng nhập thành công\n');
        }

        // Hỏi môi trường deploy
        const environment = await question('Chọn môi trường (production/preview) [production]: ');
        const isPreview = environment.toLowerCase() === 'preview';

        // Hỏi có muốn build lại không
        const shouldBuild = await question('Build lại dự án? (y/n) [y]: ');
        
        if (shouldBuild.toLowerCase() !== 'n') {
            // Build dự án
            console.log('🔨 Building project...');
            execCommand('npm run build');
            console.log('✅ Build successful!\n');
        }

        // Kiểm tra thư mục dist
        const distPath = path.join(__dirname, 'dist');
        if (!fs.existsSync(distPath)) {
            throw new Error('Thư mục dist không tồn tại sau khi build!');
        }

        // Kiểm tra biến môi trường
        console.log('🔍 Kiểm tra biến môi trường...');
        try {
            execCommand('wrangler pages secret list', { stdio: 'pipe' });
            console.log('✅ Biến môi trường đã được cấu hình\n');
        } catch (error) {
            console.log('⚠️  Không thể kiểm tra biến môi trường. Đảm bảo VITE_GEMINI_API_KEY đã được cấu hình\n');
        }

        // Deploy lên Cloudflare Pages
        console.log('🌐 Deploying to Cloudflare Pages...');
        const deployCommand = isPreview 
            ? 'wrangler pages deploy dist --project-name=create-image-studio --preview'
            : 'wrangler pages deploy dist --project-name=create-image-studio';
        
        const commitMessage = await question('Nhập commit message (để trống để tự động tạo): ');
        const finalCommand = commitMessage 
            ? `${deployCommand} --commit-message="${commitMessage}"`
            : `${deployCommand} --commit-message="Auto deploy $(date '+%Y-%m-%d %H:%M:%S')"`;
        
        execCommand(finalCommand);

        console.log('\n✅ Deploy successful!');
        console.log('🌐 Your site is now live at:');
        console.log(`   Production: https://create-image-studio.pages.dev`);
        console.log(`   Preview: https://create-image-studio.pages.dev`);
        
        console.log('\n📊 Các lệnh hữu ích:');
        console.log('   Xem lịch sử deploy: wrangler pages deployment list --project-name=create-image-studio');
        console.log('   Xem logs: wrangler pages deployment tail --project-name=create-image-studio');
        console.log('   Rollback: wrangler pages deployment rollback <deployment-id> --project-name=create-image-studio');

    } catch (error) {
        console.error('\n❌ Deploy failed:', error.message);
        console.log('\n🔧 Gỡ lỗi:');
        console.log('1. Kiểm tra kết nối internet');
        console.log('2. Đảm bảo bạn đã đăng nhập vào Cloudflare: wrangler login');
        console.log('3. Kiểm tra biến môi trường: wrangler pages secret list');
        console.log('4. Xem logs chi tiết: wrangler pages deploy dist --project-name=create-image-studio --verbose');
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Chạy hàm chính
deploy();