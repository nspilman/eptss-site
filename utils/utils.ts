export const getIsSuccess = (responseCode: number) => {
  return [200, 201].includes(responseCode);
};
