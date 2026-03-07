import postModel from "../post/post.model.js";
import serviceModel from "../service/service.model.js";
import destinationModel from "./destination.model.js";

export const getDestinationContent = async (req, res) => {
  try {
    const { code } = req.params;
    const destination = await destinationModel.findOne({
      code: code,
      isActive: true,
    });
    if (!destination) {
      return res.status(404).json({ message: "Không tìm thấy địa điểm này" });
    }

    const posts = await postModel
      .find({
        destinationId: destination._id,
        status: "approved",
      })
      .sort({ createdAt: -1 });

    const featuredServices = await serviceModel
      .find({
        destination: destination._id,
        status: "approved",
        $or: [{ isPriority: true }, { isFeatured: true }],
      })
      .populate("partner", "businessName logo partnerTier")
      .limit(5);
    return res.status(200).json({
      success: true,
      data: {
        destination,
        posts,
        recommendedServices: featuredServices,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const getAcitveDestinations = async (req, res) => {
  try {
    const destinations = await destinationModel
      .find({ isActive: true })
      .select("_id name")
      .sort({ name: 1 });

    res.status(200).json(destinations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi hẹ thống khi lấy danh sách tỉnh thành",
      error: error.message,
    });
  }
};

export const getDestinationDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const destination = await destinationModel.findOne({
      code: slug,
    });

    if (!destination) {
      return res.status(404).json({ message: "Không tìm thấy điểm đến" });
    }

    const posts = await postModel
      .find({
        destinationId: destination._id,
        status: "approved",
      })
      .select("title banner content gallery relatedArticles")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post, index) => ({
      id: index + 1,
      title: post.title,
      banner: post.banner,
      content: post.content,
      gallery: post.gallery.map((img, i) => ({
        id: i + 1,
        image: img.image,
        alt: img.alt,
      })),
      relatedArticles: post.relatedArticles || [],
    }));

    res.status(200).json({
      slug: destination.code,
      title: destination.name,
      posts: formattedPosts,
      isActive: destination.isActive,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết destination:", error);
    res.status(500).json({
      message: "Lỗi hệ thống khi lấy thông tin điểm đến",
      error: error.message,
    });
  }
};
