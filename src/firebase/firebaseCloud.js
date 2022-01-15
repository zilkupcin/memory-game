import { functions, httpsCallable } from "./firebase";

const runCloud = async (funcName, data) => {
  const cloudFunc = httpsCallable(functions, funcName);

  try {
    const result = await cloudFunc(data);
    return { status: "success", body: result.data };
  } catch (e) {
    return { status: "error", body: e.stack };
  }
};

export { runCloud };
