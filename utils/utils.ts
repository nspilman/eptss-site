export const getIsSuccess = (responseCode: number) => {
  return [200, 201, 204].includes(responseCode);
};
