# Audio Description Feature

This feature provides audio descriptions for UI elements when users hover over them, making the application more accessible for neurodiverse users.

## How to Use

### 1. Basic Usage with AudioDescriptionDirective

Wrap any element with the `AudioDescriptionDirective` component:

```jsx
import { AudioDescriptionDirective } from '../AudioDescription';

// In your component:
<AudioDescriptionDirective description="This is a submit button">
  <button>Submit</button>
</AudioDescriptionDirective>
```

### 2. Using the useAudioHover Hook

For more control, use the custom hook with a ref:

```jsx
import { useRef } from 'react';
import { useAudioHover } from '../AudioDescription';

// In your component:
const buttonRef = useRef(null);
useAudioHover(buttonRef, "This is a submit button");

// Then in your JSX:
<button ref={buttonRef}>Submit</button>
```

### 3. Using withAudioDescription HOC

For class components or to add audio description capabilities to an entire component:

```jsx
import { withAudioDescription } from '../AudioDescription';

// Your component
const MyComponent = ({ isAudioDescriptionEnabled, speakText }) => {
  // Use speakText function and isAudioDescriptionEnabled flag
  return (
    <button 
      onMouseEnter={() => isAudioDescriptionEnabled && speakText("Submit form")}
    >
      Submit
    </button>
  );
};

export default withAudioDescription(MyComponent);
```

### 4. Direct Access to Context

For more complex scenarios:

```jsx
import { useAudioDescription } from '../AudioDescription';

// In your component:
const { isAudioDescriptionEnabled, speakText } = useAudioDescription();

// Then in your JSX:
<button 
  onMouseEnter={() => isAudioDescriptionEnabled && speakText("Submit form")}
>
  Submit
</button>
```

## Toggle Component

The `AudioDescriptionToggle` component provides a button to enable/disable audio descriptions:

```jsx
import { AudioDescriptionToggle } from '../AudioDescription';

// In your component:
<AudioDescriptionToggle />
```