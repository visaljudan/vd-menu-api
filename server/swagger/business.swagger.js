// Create business

/**
 * @swagger
 * /api/v1/businesses:
 *   post:
 *     summary: Create a new Business
 *     tags:
 *       - Businesses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telegramId
 *               - name
 *               - description
 *               - location
 *               - logo
 *               - image
 *             properties:
 *               telegramId:
 *                 type: string
 *                 description: Telegram ID linked to the business
 *                 example: 65f5d12e0a1cb8a456789abc
 *               name:
 *                 type: string
 *                 example: My Business Name
 *               description:
 *                 type: string
 *                 example: A brief description of the business
 *               location:
 *                 type: string
 *                 example: Phnom Penh, Cambodia
 *               logo:
 *                 type: string
 *                 example: https://example.com/logo.jpg
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 example: active
 *     responses:
 *       201:
 *         description: Business created successfully
 *       400:
 *         description: Validation error - missing or invalid fields
 *       403:
 *         description: Permission denied - Telegram ID doesn't belong to user
 *       404:
 *         description: Telegram ID not found
 *       500:
 *         description: Internal server error
 */

// Get businesses

/**
 * @swagger
 * /api/v1/businesses:
 *   get:
 *     summary: Get a list of Businesses (admin or user)
 *     tags:
 *       - Businesses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         required: false
 *         schema:
 *           type: string
 *           example: createdAt
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *       - name: search
 *         in: query
 *         description: Search by business name, description, or location
 *         required: false
 *         schema:
 *           type: string
 *           example: Phnom Penh
 *       - name: userId
 *         in: query
 *         description: Filter businesses by userId (Admin only)
 *         required: false
 *         schema:
 *           type: string
 *           example: 65f5c080fe3cb9a123456789
 *       - name: status
 *         in: query
 *         description: Filter by business status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *           example: active
 *     responses:
 *       200:
 *         description: Businesses fetched successfully
 *       403:
 *         description: Forbidden - User tried to filter by another user's userId
 *       500:
 *         description: Internal server error
 */

// Get business

/**
 * @swagger
 * /api/v1/businesses/{id}:
 *   get:
 *     summary: Get a specific business by ID
 *     tags:
 *       - Businesses
 *     description: Fetches a single business by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the business to fetch
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The business details
 *       404:
 *         description: Business not found
 */

// Update business

/**
 * @swagger
 * /api/v1/businesses/{id}:
 *   patch:
 *     summary: Update a Business (only owner or admin)
 *     tags:
 *       - Businesses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Business ID to update
 *         required: true
 *         schema:
 *           type: string
 *           example: 65f5e123ab0fcd7890abcdef
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Coffee & Co.
 *               description:
 *                 type: string
 *                 example: Cozy coffee shop in Phnom Penh
 *               location:
 *                 type: string
 *                 example: Phnom Penh, Cambodia
 *               logo:
 *                 type: string
 *                 example: https://example.com/logo.jpg
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 example: active
 *               telegramId:
 *                 type: string
 *                 example: 65f5d12e0a1cb8a456789abc
 *     responses:
 *       200:
 *         description: Business updated successfully
 *       400:
 *         description: Invalid input or data format
 *       403:
 *         description: Forbidden - Not allowed to update this business
 *       404:
 *         description: Business or Telegram not found
 *       500:
 *         description: Internal server error
 */

// Delete business

/**
 * @swagger
 * /api/v1/businesses/{id}:
 *   delete:
 *     summary: Delete a business (only owner or admin)
 *     tags:
 *       - Businesses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Business ID to delete
 *         schema:
 *           type: string
 *           example: 65f5e123ab0fcd7890abcdef
 *     responses:
 *       200:
 *         description: Business deleted successfully
 *       400:
 *         description: Invalid Business ID format
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
