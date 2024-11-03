export const load = async ({ data }) => {
  console.log('Page load data:', data);
  return data;
};

export const ssr = true;
export const csr = true; 