const { createNavigatorFactory } = require("@react-navigation/core");
const result = createNavigatorFactory({})();
console.log("Screen:", typeof result.Screen, result.Screen);
console.log("Group:", typeof result.Group, result.Group);
