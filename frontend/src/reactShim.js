if (typeof window !== 'undefined') {
  const originalReact = window.React;

  Object.defineProperty(window, 'React', {
    get: function() {
      if (originalReact && !originalReact.Children) {
        originalReact.Children = {
          map: function(children, fn) {
            return Array.isArray(children) ? children.map(fn) : (children ? [fn(children)] : []);
          },
          forEach: function(children, fn) {
            if (Array.isArray(children)) children.forEach(fn);
            else if (children) fn(children);
          },
          count: function(children) {
            return Array.isArray(children) ? children.length : (children ? 1 : 0);
          },
          only: function(children) {
            if (!children) throw new Error('React.Children.only expected to receive a single React element child.');
            return Array.isArray(children) ? children[0] : children;
          },
          toArray: function(children) {
            return Array.isArray(children) ? children : (children ? [children] : []);
          }
        };
      }
      return originalReact;
    },
    configurable: true
  });
}

export default {};