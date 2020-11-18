const isFileExists = (fn) => {
  try {
    Deno.readFileSync(fn);
    return true;
  } catch (e) {
  }
  return false;
};

export { isFileExists };
