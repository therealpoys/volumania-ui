// Minimal frontend-only server for Volumania
// This just starts the Vite development server for the frontend

import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function startFrontendServer() {
  try {
    console.log('🚀 Starting Volumania Frontend-Only Server');
    console.log('📊 Mode: Mock Data (no Kubernetes backend required)');
    
    // Create Vite server with the existing config
    const server = await createServer({
      configFile: path.resolve(projectRoot, 'vite.config.ts'),
      server: {
        host: '0.0.0.0',
        port: 5000,
        allowedHosts: true, // Allow all hosts for Replit environment
      }
    });

    await server.listen();
    
    console.log('✅ Frontend server started successfully');
    console.log('🌐 Application running at: http://0.0.0.0:5000');
    console.log('💡 Using mock data - no Kubernetes cluster connection needed');
    
    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down frontend server...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down frontend server...');
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start frontend server:', error);
    process.exit(1);
  }
}

startFrontendServer();