// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Đăng ký, đăng nhập, refresh token
 *   - name: Users
 *     description: Quản lý user
 *   - name: Instructors
 *     description: Quản lý instructor
 *   - name: Courses
 *     description: Quản lý khóa học
 *   - name: Categories
 *     description: Danh mục khóa học
 *   - name: Lessons
 *     description: Bài học
 *   - name: Price Tiers
 *     description: Bảng giá
 *   - name: Coupons
 *     description: Mã giảm giá
 *   - name: Promotions
 *     description: Chương trình khuyến mãi
 *   - name: FAQs
 *     description: Câu hỏi thường gặp
 *   - name: Materials
 *     description: Tài liệu bài học
 *   - name: Notes
 *     description: Ghi chú bài học
 *   - name: Course Reviews
 *     description: Đánh giá khóa học
 *   - name: Instructor Reviews
 *     description: Đánh giá instructor
 *   - name: Review Replies
 *     description: Phản hồi đánh giá
 *   - name: Cart
 *     description: Giỏ hàng
 *   - name: Orders
 *     description: Đơn hàng
 *   - name: Wishlists
 *     description: Danh sách yêu thích
 *   - name: Discussions
 *     description: Thảo luận bài học
 *   - name: Quiz
 *     description: Quiz bài học
 *   - name: Notifications
 *     description: Thông báo
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Nguyen Van A" }
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       201: { description: Đăng ký thành công }
 *       409: { description: Email đã tồn tại }
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Đăng nhập thành công, trả về token }
 *       401: { description: Sai email/mật khẩu }
 *
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200: { description: Token mới }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin user hiện tại
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Thông tin user }
 *   put:
 *     tags: [Users]
 *     summary: Cập nhật profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Cập nhật thành công }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Courses]
 *     summary: Danh sách khóa học
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách khóa học }
 *   post:
 *     tags: [Courses]
 *     summary: Tạo khóa học mới
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string }
 *               priceTierId: { type: string }
 *               thumbnail: { type: string, format: binary }
 *               demo: { type: string, format: binary }
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Chi tiết khóa học
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Chi tiết khóa học }
 *   put:
 *     tags: [Courses]
 *     summary: Cập nhật khóa học
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cập nhật thành công }
 *   delete:
 *     tags: [Courses]
 *     summary: Xóa khóa học
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Xóa thành công }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Danh sách danh mục
 *     responses:
 *       200: { description: Danh sách danh mục }
 *   post:
 *     tags: [Categories]
 *     summary: Tạo danh mục
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Tạo thành công }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// LESSONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /lessons/course/{courseId}:
 *   get:
 *     tags: [Lessons]
 *     summary: Danh sách bài học của khóa học
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách bài học }
 *   post:
 *     tags: [Lessons]
 *     summary: Tạo bài học
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               video: { type: string, format: binary }
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Chi tiết bài học
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Chi tiết bài học }
 *   put:
 *     tags: [Lessons]
 *     summary: Cập nhật bài học
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cập nhật thành công }
 *   delete:
 *     tags: [Lessons]
 *     summary: Xóa bài học
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Xóa thành công }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COURSE REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /course-reviews/course/{courseId}:
 *   get:
 *     tags: [Course Reviews]
 *     summary: Danh sách đánh giá khóa học (kèm reply)
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách review + averageRating + total }
 *   post:
 *     tags: [Course Reviews]
 *     summary: Đánh giá khóa học (phải đã mua)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Đánh giá thành công }
 *       403: { description: Chưa mua khóa học }
 *       409: { description: Đã đánh giá rồi }
 *
 * /course-reviews/{reviewId}/reply:
 *   post:
 *     tags: [Review Replies]
 *     summary: Instructor phản hồi đánh giá khóa học
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string }
 *     responses:
 *       201: { description: Phản hồi thành công }
 *       403: { description: Không phải instructor của khóa học }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW REPLIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /review-replies/{id}:
 *   put:
 *     tags: [Review Replies]
 *     summary: Sửa phản hồi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string }
 *     responses:
 *       200: { description: Sửa thành công }
 *   delete:
 *     tags: [Review Replies]
 *     summary: Xóa phản hồi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Xóa thành công }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CART
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Xem giỏ hàng
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách khóa học trong giỏ }
 *   post:
 *     tags: [Cart]
 *     summary: Thêm khóa học vào giỏ
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId: { type: string }
 *     responses:
 *       201: { description: Thêm thành công }
 *
 * /cart/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Xóa khỏi giỏ hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Xóa thành công }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Danh sách đơn hàng (admin tất cả, user chỉ của mình)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách đơn hàng }
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId: { type: string }
 *               couponCode: { type: string }
 *               paymentMethod: { type: string }
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /orders/{id}/complete:
 *   patch:
 *     tags: [Orders]
 *     summary: Hoàn thành đơn hàng (thanh toán xong)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Hoàn thành }
 *
 * /orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Hủy đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Hủy thành công }
 *
 * /orders/{id}/refund:
 *   patch:
 *     tags: [Orders]
 *     summary: Hoàn tiền
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Hoàn tiền thành công }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// WISHLISTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /wishlists/toggle:
 *   post:
 *     tags: [Wishlists]
 *     summary: Thích/bỏ thích khóa học hoặc bài học
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetType, targetId]
 *             properties:
 *               targetType: { type: string, enum: [course, lesson] }
 *               targetId: { type: string }
 *     responses:
 *       200: { description: "Trả về liked: true/false" }
 *
 * /wishlists/my-courses:
 *   get:
 *     tags: [Wishlists]
 *     summary: Danh sách khóa học yêu thích
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách }
 *
 * /wishlists/batch-check:
 *   post:
 *     tags: [Wishlists]
 *     summary: Kiểm tra nhiều item cùng lúc
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetType: { type: string, enum: [course, lesson] }
 *               targetIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Mảng các ID đã thích }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// DISCUSSIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /lessons/{lessonId}/discussions:
 *   get:
 *     tags: [Discussions]
 *     summary: Xem thảo luận bài học (dạng cây)
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cây thảo luận }
 *   post:
 *     tags: [Discussions]
 *     summary: Đặt câu hỏi hoặc trả lời (cần đã mua khóa học)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *               parentId: { type: string, description: "ID comment cha (nếu là reply)" }
 *     responses:
 *       201: { description: Tạo thành công }
 *       403: { description: Chưa mua khóa học }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /lessons/{lessonId}/quiz:
 *   get:
 *     tags: [Quiz]
 *     summary: Lấy quiz bài học (ẩn đáp án đúng)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách câu hỏi + đáp án }
 *
 * /lessons/{lessonId}/quiz/submit:
 *   post:
 *     tags: [Quiz]
 *     summary: Nộp bài quiz
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId: { type: string }
 *                     answerId: { type: string }
 *     responses:
 *       201: { description: "Kết quả: score, totalQuestions, chi tiết" }
 *
 * /lessons/{lessonId}/quiz/attempts:
 *   get:
 *     tags: [Quiz]
 *     summary: Lịch sử làm quiz
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách attempts }
 *
 * /lessons/{lessonId}/quiz/questions:
 *   get:
 *     tags: [Quiz]
 *     summary: "[Instructor] Xem câu hỏi (kèm isCorrect)"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Danh sách câu hỏi }
 *   post:
 *     tags: [Quiz]
 *     summary: "[Instructor] Tạo câu hỏi + 4 đáp án"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answers]
 *             properties:
 *               questionType: { type: string, enum: [text, text_image], default: text }
 *               question: { type: string }
 *               imageUrl: { type: string }
 *               answers:
 *                 type: array
 *                 minItems: 4
 *                 maxItems: 4
 *                 items:
 *                   type: object
 *                   properties:
 *                     content: { type: string }
 *                     isCorrect: { type: boolean }
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /quiz/questions/{id}:
 *   put:
 *     tags: [Quiz]
 *     summary: "[Instructor] Sửa câu hỏi"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Sửa thành công }
 *   delete:
 *     tags: [Quiz]
 *     summary: "[Instructor] Xóa câu hỏi"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Xóa thành công }
 *
 * /quiz/attempts/{attemptId}:
 *   get:
 *     tags: [Quiz]
 *     summary: Chi tiết 1 lần làm (đáp án chọn + đúng/sai)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Chi tiết attempt }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Danh sách thông báo (phân trang)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: "notifications[], total, unreadCount" }
 *
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Đếm thông báo chưa đọc
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "{ count: number }" }
 *
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Đánh dấu tất cả đã đọc
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Đã đánh dấu }
 *
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Đánh dấu 1 thông báo đã đọc
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã đánh dấu }
 *
 * /notifications/clear:
 *   delete:
 *     tags: [Notifications]
 *     summary: Xóa tất cả thông báo đã đọc
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Đã xóa }
 *
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Xóa 1 thông báo
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã xóa }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PRICE TIERS, COUPONS, PROMOTIONS, FAQS, MATERIALS, NOTES, INSTRUCTORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /price-tiers:
 *   get:
 *     tags: [Price Tiers]
 *     summary: Danh sách bảng giá
 *     responses:
 *       200: { description: Danh sách }
 *   post:
 *     tags: [Price Tiers]
 *     summary: Tạo bảng giá (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: Danh sách mã giảm giá
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách }
 *   post:
 *     tags: [Coupons]
 *     summary: Tạo coupon
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /promotions:
 *   get:
 *     tags: [Promotions]
 *     summary: Danh sách chương trình KM
 *     responses:
 *       200: { description: Danh sách }
 *   post:
 *     tags: [Promotions]
 *     summary: Tạo promotion
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /faqs:
 *   get:
 *     tags: [FAQs]
 *     summary: Danh sách FAQ
 *     responses:
 *       200: { description: Danh sách }
 *   post:
 *     tags: [FAQs]
 *     summary: Tạo FAQ
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Tạo thành công }
 *
 * /instructors:
 *   get:
 *     tags: [Instructors]
 *     summary: Danh sách instructor
 *     responses:
 *       200: { description: Danh sách }
 */
