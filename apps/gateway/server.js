const gateway = require('express-gateway');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Start Express Gateway
gateway()
  .load(path.join(__dirname, 'gateway.config.yml'))
  .run()
  .then(() => {
    console.log('🚀 Express Gateway is running on port 8080');
    console.log('📡 Gateway endpoints:');
    console.log('   - Input Handler:      /api/input/*');
    console.log('   - Preprocessor:       /api/preprocess/*');
    console.log('   - ASR Service:        /api/asr/*');
    console.log('   - Text Cleaner:       /api/text-clean/*');
    console.log('   - LLM Service:        /api/llm/*');
    console.log('   - Semantic Formatter: /api/semantic/*');
    console.log('   - TTS Service:        /api/tts/*');
    console.log('   - Audio Post:         /api/audio-post/*');
    console.log('   - Encoder:            /api/encode/*');
    console.log('   - Delivery:           /api/delivery/*');
    console.log('   - Health Check:       /health');
  })
  .catch(err => {
    console.error('❌ Failed to start Express Gateway:', err);
    process.exit(1);
  });
