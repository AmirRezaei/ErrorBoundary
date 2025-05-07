# ErrorBoundary Component

A React error boundary component with advanced debugging capabilities and Material-UI integration.

## Installation

```bash
npm install itk-error-boundary
# or
yarn add itk-error-boundary
```

## Usage

```tsx
import { ErrorBoundary } from 'itk-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>} logLimit={100}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Features

- Advanced error boundary with debugging capabilities
- Material-UI integration
- Console log capture
- Stack trace parsing
- Error reporting
- Debug panel for development

## Props

| Prop | Type | Description |
|------|------|-------------|
| fallback | ReactNode | Component to render when an error occurs |
| onError | (error: Error, errorInfo: React.ErrorInfo) => void | Callback when an error occurs |
| defaultDebugPanelOpen | boolean | Whether the debug panel should be open by default |

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build package
yarn build
```

## License

MIT

## Keywords

- React
- Error Boundary
- Debugging
- TypeScript
- Console Logging
- Stack Traces
- Development Tools
- Error Reporting
- Browser Storage Monitoring
