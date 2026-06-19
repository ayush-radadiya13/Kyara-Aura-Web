import { CUSTOMER_REVIEWS_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export async function submitCustomerReviewApi({ product_id, rating, review }) {
  const { data } = await customAxios.post(CUSTOMER_REVIEWS_API_ROUTES.CREATE, {
    product_id,
    rating,
    review,
  });

  return data;
}
