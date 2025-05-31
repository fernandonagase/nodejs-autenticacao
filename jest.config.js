import { createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
  //...options
});

const jestConfig = {
  ...presetConfig,
  moduleNameMapper: {
    "(.+)\\.js": "$1",
  },
  testPathIgnorePatterns: ["dist/", "node_modules/"],
};

export default jestConfig;
