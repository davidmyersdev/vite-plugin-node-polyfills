import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
var queryClient = new QueryClient();
function App() {
    var _a = useState(0), count = _a[0], setCount = _a[1];
    return (_jsxs("div", { className: 'App', children: [_jsx("h1", { children: "Example (React)" }), _jsx("p", { children: "The following app includes React Query DevTools (see below) to assert that this plugin does not conflict with it." }), _jsx("p", { children: "Here is a dynamic counter to test that React works as expected." }), _jsx("p", { children: _jsxs("button", { onClick: function () { return setCount(function (count) { return count + 1; }); }, children: ["count is ", count] }) }), _jsxs("p", { children: ["The following text is encoded and decoded with Buffer: ", Buffer.from('Hello!').toString()] })] }));
}
export var app = function () {
    ReactDOM.createRoot(document.getElementById('react-app')).render(_jsx(React.StrictMode, { children: _jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(App, {}), _jsx(ReactQueryDevtools, { initialIsOpen: true })] }) }));
};
