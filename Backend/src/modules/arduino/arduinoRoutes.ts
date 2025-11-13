import { Router } from 'express';
import { arduinoService } from './arduinoService.js';

const router = Router();

// Get Arduino connection status
router.get('/status', (req, res) => {
  res.json({ 
    connected: arduinoService.isConnected(),
    message: arduinoService.isConnected() ? 'Arduino is connected' : 'Arduino is disconnected'
  });
});

// Send dispense command to Arduino
router.post('/dispense', async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || (command !== 'single' && command !== 'double')) {
      return res.status(400).json({ 
        error: 'Invalid command. Must be "single" or "double"' 
      });
    }

    if (!arduinoService.isConnected()) {
      return res.status(503).json({ 
        error: 'Arduino is not connected' 
      });
    }

    await arduinoService.sendCommand(command);

    res.json({ 
      success: true, 
      message: `Command "${command}" sent to Arduino successfully` 
    });
  } catch (error) {
    console.error('Error sending command to Arduino:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send command to Arduino' 
    });
  }
});

export const arduinoRouter = router;
