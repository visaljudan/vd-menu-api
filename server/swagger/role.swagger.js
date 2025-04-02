// Create role

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     tags:
 *       - Roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the role
 *                 example: "Admin"
 *               description:
 *                 type: string
 *                 description: A brief description of the role
 *                 example: "Administrator with full access"
 *               status:
 *                 type: string
 *                 description: The status of the role (active or inactive)
 *                 enum: ["active", "inactive"]
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request due to missing or invalid parameters
 *       409:
 *         description: Conflict due to role name or slug already existing
 *       500:
 *         description: Internal server error
 */

// Get roles

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Retrieve a list of roles
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of roles per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: name
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *         description: Order of sorting
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: admin
 *         description: Search string to filter roles by name, slug, or description
 *     responses:
 *       '200':
 *         description: Roles fetched successfully
 */

// Get role

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Fetch a role by its ID
 *     tags:
 *       - Roles
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The unique ID of the role
 *         required: true
 *         type: string
 *         format: objectId
 *         example: "60d0fe4f5311236168a109ca"  # Example of a valid ObjectId
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *       400:
 *         description: Invalid role ID format
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */

// Update role

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   patch:
 *     summary: "Update a role by its ID"
 *     tags:
 *       - "Roles"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "The unique ID of the role"
 *         required: true
 *         type: string
 *         format: objectId
 *         example: "60d0fe4f5311236168a109ca"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Editor"
 *               description:
 *                 type: string
 *                 example: "Role with editing privileges"
 *               status:
 *                 type: string
 *                 enum:
 *                   - "active"
 *                   - "inactive"
 *                 example: "active"
 *     responses:
 *       200:
 *         description: "Role updated successfully"
 *       400:
 *         description: "Invalid role ID format or invalid status"
 *       404:
 *         description: "Role not found"
 *       409:
 *         description: "Role name already exists"
 *       500:
 *         description: "Internal server error"
 */

// Delete role

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: "Delete a role by its ID"
 *     tags:
 *       - "Roles"
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "The unique ID of the role to be deleted"
 *         required: true
 *         type: string
 *         format: objectId
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: "Role deleted successfully"
 *       400:
 *         description: "Invalid role ID format"
 *       404:
 *         description: "Role not found"
 *       500:
 *         description: "Internal server error"
 */
