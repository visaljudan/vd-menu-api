// Create subscription Plan

/**
 * @swagger
 * /api/v1/subscription-plans:
 *   post:
 *     summary: Create a subscription plan
 *     description: Allows admin to create a new subscription plan with pricing, duration, and limitations.
 *     tags:
 *       - Subscription Plans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *               - feature
 *               - maxBusiness
 *               - maxCategory
 *               - maxItem
 *               - analysisType
 *             properties:
 *               name:
 *                 type: string
 *                 example: Starter Plan
 *               price:
 *                 type: number
 *                 example: 29.99
 *               duration:
 *                 type: string
 *                 example: 30 days
 *               feature:
 *                 type: string
 *                 example: Access to basic analytics and tools
 *               maxBusiness:
 *                 type: integer
 *                 example: 5
 *               maxCategory:
 *                 type: integer
 *                 example: 10
 *               maxItem:
 *                 type: integer
 *                 example: 100
 *               analysisType:
 *                 type: string
 *                 example: basic
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       201:
 *         description: Subscription plan created successfully
 *       400:
 *         description: Bad request - Missing or invalid fields
 *       409:
 *         description: Conflict - Duplicate name or slug
 *       500:
 *         description: Internal server error
 */

// Get subscription plans

/**
 * @swagger
 * /api/v1/subscription-plans:
 *   get:
 *     summary: Get all subscription plans
 *     description: Retrieve a paginated list of subscription plans with optional search, sorting, and ordering.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of plans per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or slug (case-insensitive)
 *     responses:
 *       200:
 *         description: Subscription plans fetched successfully
 *       500:
 *         description: Internal server error
 */

// Get subscription plan

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   get:
 *     summary: Get a subscription plan by ID
 *     description: Retrieve details of a specific subscription plan using its ID.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567b89c0123d45678"
 *         description: The ID of the subscription plan.
 *     responses:
 *       200:
 *         description: Subscription plan retrieved successfully
 *       400:
 *         description: Invalid subscription plan ID format
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */

// Update subscription plan

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   patch:
 *     summary: Update a subscription plan
 *     description: Update the details of a subscription plan by its ID.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567b89c0123d45678"
 *         description: The ID of the subscription plan to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Plan"
 *               price:
 *                 type: number
 *                 example: 29.99
 *               duration:
 *                 type: integer
 *                 example: 30
 *               feature:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Feature1", "Feature2"]
 *               maxBusiness:
 *                 type: integer
 *                 example: 10
 *               maxCategory:
 *                 type: integer
 *                 example: 5
 *               maxItem:
 *                 type: integer
 *                 example: 100
 *               analysisType:
 *                 type: string
 *                 enum: ["basic", "advanced"]
 *                 example: "basic"
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive"]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully
 *       400:
 *         description: Invalid subscription plan ID format or missing required fields
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */

// Delete subscription plan

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   delete:
 *     summary: Delete a subscription plan
 *     description: Deletes a subscription plan by its ID.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567b89c0123d45678"
 *         description: The ID of the subscription plan to delete.
 *     responses:
 *       200:
 *         description: Subscription plan deleted successfully
 *       400:
 *         description: Invalid subscription plan ID format
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */
