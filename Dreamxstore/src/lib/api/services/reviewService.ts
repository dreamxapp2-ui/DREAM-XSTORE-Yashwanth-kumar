// Review Service - Review and rating API calls
import { apiClient } from '../client';

export interface ReviewData {
  productId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsListResponse {
  success: boolean;
  data: ReviewResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export class ReviewService {
  /**
   * Create a new review for a product
   */
  static async createReview(data: ReviewData): Promise<ReviewResponse> {
    return await apiClient.post<ReviewResponse>('/reviews', data);
  }

  /**
   * Get all reviews for a product with pagination
   */
  static async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt'
  ): Promise<ReviewsListResponse> {
    return await apiClient.get<ReviewsListResponse>(
      `/reviews/product/${productId}?page=${page}&limit=${limit}&sortBy=${sortBy}`
    );
  }

  /**
   * Get user's review for a specific product
   */
  static async getUserProductReview(productId: string): Promise<ReviewResponse> {
    return await apiClient.get<ReviewResponse>(`/reviews/user/${productId}`);
  }

  /**
   * Get a specific review by ID
   */
  static async getReview(reviewId: string): Promise<ReviewResponse> {
    return await apiClient.get<ReviewResponse>(`/reviews/${reviewId}`);
  }

  /**
   * Update a review
   */
  static async updateReview(
    reviewId: string,
    data: Partial<ReviewData>
  ): Promise<ReviewResponse> {
    return await apiClient.put<ReviewResponse>(`/reviews/${reviewId}`, data);
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  }
}

export default ReviewService;
