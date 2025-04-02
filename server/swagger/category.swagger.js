// Create categories

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category for a business (owner only)
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - name
 *             properties:
 *               businessId:
 *                 type: string
 *                 description: The ID of the business
 *                 example: 65f63c30e84f70dca5bfa123
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: Beverages
 *               description:
 *                 type: string
 *                 description: Category description
 *                 example: All types of drinks and beverages
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Category status
 *                 example: active
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad Request - Missing or invalid fields
 *       403:
 *         description: Permission denied - Not the owner of the business
 *       404:
 *         description: Business not found
 *       409:
 *         description: Duplicate category name or slug
 *       500:
 *         description: Internal server error
 */

// Get categories

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get a list of categories
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
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
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for name, slug, or description
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: Filter by Business ID (admin only)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       403:
 *         description: Unauthorized filtering attempt
 *       500:
 *         description: Internal server error
 */

// Get category

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get a specific category by ID
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       400:
 *         description: Invalid Category ID format
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */

// Update category

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to be updated.
 *         schema:
 *           type: string
 *       - in: body
 *         name: category
 *         description: The category information to be updated.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             businessId:
 *               type: string
 *               description: The ID of the business to which the category belongs.
 *             name:
 *               type: string
 *               description: The name of the category.
 *             description:
 *               type: string
 *               description: A description of the category.
 *             status:
 *               type: string
 *               enum: [active, inactive]
 *               description: The status of the category (either "active" or "inactive").
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid category ID format or invalid data format
 *       403:
 *         description: Only the owner or an admin can update this category.
 *       404:
 *         description: Category not found or business not found
 *       409:
 *         description: Category name or slug already exists for this business
 *       500:
 *         description: Internal server error
 */

// Datele category

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: "Delete a category by its ID"
 *     description: "Deletes the category with the specified ID."
 *     operationId: deleteCategory
 *     tags:
 *       - "Categories"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "The unique ID of the category to be deleted"
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: "Category deleted successfully"
 *       400:
 *         description: "Invalid category ID format"
 *       403:
 *         description: "Only the owner or an admin can update"
 *       404:
 *         description: "Category not found"
 *       500:
 *         description: "Internal server error"
 */
