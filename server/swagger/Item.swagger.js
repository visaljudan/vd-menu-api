// Create Item
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
