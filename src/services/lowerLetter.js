// Helper function to convert string to camelCase
function toCamelCase(str) {
    if (!str || typeof str !== "string") {
     return str; // Return input as is if it's not a string
 }
 return str.charAt(0).toLowerCase() + str.slice(1);
}

// Recursive function to convert keys to camelCase
function convertToCamelCase(obj) {
 if (Array.isArray(obj)) {
     return obj.map((item) => convertToCamelCase(item));
 } else if (obj !== null && typeof obj === 'object') {
     return Object.keys(obj).reduce((acc, key) => {
         const camelCaseKey = toCamelCase(key);
         acc[camelCaseKey] = convertToCamelCase(obj[key]);
         return acc;
     }, {});
 }
 return obj;
}


export default convertToCamelCase;