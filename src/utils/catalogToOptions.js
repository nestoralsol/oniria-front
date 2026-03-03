// src/utils/catalogToOptions.js

export function toOptions(arr = []) {
  return arr.map((x) => ({
    value: x.key,
    label: x.display_key ?? x.key,
    description: x.display_description,
  }));
}
