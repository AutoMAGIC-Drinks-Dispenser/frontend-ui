# Communication Module Structure

This folder contains all serial communication logic for the Arduino ATmega 2560 connection.

## File Structure

### **serialService.ts** (Core Logic)
The main service file that handles all serial port operations.

**Exports:**
- `sendDataToArduino(data: string)` - Send commands to Arduino
- `requestSerialPort()` - Open serial port connection
- `closeSerialPort()` - Close serial port connection
- `isSerialConnected()` - Check connection status
- `getCurrentPort()` - Get current port instance

**Internal:**
- `readFromArduino()` - Continuously reads data from Arduino (private)
- Global state management for reader/writer/port

---

### **web_serial_com.tsx** (UI Component)
React component for the connect/disconnect button.

**Exports:**
- `WebSerialCommunication` - Button component with connection UI

**Usage:**
```tsx
import { WebSerialCommunication } from './communication/web_serial_com';

<WebSerialCommunication />
```

---

### **serial_monitor.tsx** (Monitoring UI)
Real-time serial monitor component for debugging.

**Exports:**
- `SerialMonitor` - Modal component for monitoring
- `logSerialMessage(direction, data)` - Logging function

**Usage:**
```tsx
import { SerialMonitor } from './communication/serial_monitor';

<SerialMonitor isOpen={show} onClose={() => setShow(false)} />
```

---

### **api.ts** (Backend API)
HTTP requests to the Express backend.

**Exports:**
- `incrementAlltime(userId)` - Increment user's drink count
- `checkId(id)` - Verify user ID exists
- etc.

---

### **connect_btn.tsx** (Generic Button)
Reusable connect button component (if needed).

---

### **connect_functions.tsx** (Deprecated)
Legacy file - now re-exports from `serialService.ts` for backward compatibility.

---

## How to Import

### ✅ Correct Way (Use Service):
```tsx
import { sendDataToArduino, requestSerialPort, closeSerialPort } from './communication/serialService';
```

### ❌ Old Way (Deprecated):
```tsx
import { sendDataToArduino } from './communication/web_serial_com';  // Don't use
```

---

## Usage Examples

### Sending Data to Arduino:
```tsx
import { sendDataToArduino } from './communication/serialService';

const handleClick = async () => {
  await sendDataToArduino("single");
};
```

### Checking Connection:
```tsx
import { isSerialConnected } from './communication/serialService';

if (isSerialConnected()) {
  console.log("Arduino is connected");
}
```

### Connection UI:
```tsx
import { WebSerialCommunication } from './communication/web_serial_com';

function Header() {
  return <WebSerialCommunication />;
}
```

---

## Architecture

```
User Clicks Button
       ↓
Component (dispense_button.tsx)
       ↓
serialService.sendDataToArduino("single")
       ↓
Web Serial API
       ↓
Arduino ATmega 2560
       ↓
Arduino sends response
       ↓
serialService.readFromArduino() (background)
       ↓
logSerialMessage() → Serial Monitor UI
```

---

## Benefits of This Structure

1. **Separation of Concerns**: UI separate from business logic
2. **Reusability**: `serialService.ts` can be imported anywhere
3. **Testability**: Service functions can be tested independently
4. **Maintainability**: Changes to serial logic in one place
5. **Type Safety**: Proper TypeScript exports and imports
6. **No Duplicate Code**: Single source of truth for serial operations
