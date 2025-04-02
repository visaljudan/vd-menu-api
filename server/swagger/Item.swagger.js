// Create item

/**
 * @swagger
 * /api/v1/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - name
 *               - price
 *               - image
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: ID of the category
 *               name:
 *                 type: string
 *                 description: Name of the item
 *               description:
 *                 type: string
 *                 description: Description of the item
 *               price:
 *                 type: number
 *                 description: Price of the item
 *               image:
 *                 type: string
 *                 description: Image URL of the item
 *               meta:
 *                 type: object
 *                 description: Additional metadata
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the item
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Status of the item
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Invalid category ID
 *       500:
 *         description: Server error
 */

// Get items

/**
 * @swagger
 * /api/v1/items:
 *   get:
 *     summary: Get a list of items
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for item name or description
 *     responses:
 *       200:
 *         description: List of items fetched successfully
 *       500:
 *         description: Server error
 */

// Get item

/**
 * @swagger
 * /api/v1/items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     responses:
 *       200:
 *         description: Item fetched successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */

// Update item

/**
 * @swagger
 * /api/v1/items/{id}:
 *   put:
 *     summary: Update an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               meta:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */

// Delete item

/**
 * @swagger
 * /api/v1/items/{id}:
 *   delete:
 *     summary: Delete an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
