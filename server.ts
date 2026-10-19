import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will be unavailable.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 image uploads for plant diagnosis
  app.use(express.json({ limit: "20mb" }));

  // In-memory marketplace state
  // Initial products
  let products = [
    {
      id: 'p1',
      name: 'Monstera Deliciosa (Ganesh Leaf)',
      scientificName: 'Monstera deliciosa',
      description: 'Known for its iconic leaf fenestrations, the Split-Leaf Philodendron is a dramatic statement plant that thrives in warm Indian climates. Perfect for creating a tropical canopy vibe in your living room or balcony.',
      price: 699,
      rating: 4.8,
      reviewsCount: 124,
      category: 'indoor' as const,
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n1',
      nurseryName: 'Himalayan Greens Nursery',
      stock: 25,
      light: 'indirect' as const,
      water: 'moderate' as const,
      difficulty: 'easy' as const,
      features: ['Air Purifying', 'Dramatic Foliage', 'Fast Growing'],
      size: 'Medium (6" grower pot)',
      isPrime: true
    },
    {
      id: 'p2',
      name: 'Snake Plant Laurentii',
      scientificName: 'Sansevieria trifasciata',
      description: 'One of the hardiest houseplants available in India. It can survive long dry spells during summers and low light conditions. Known for its vertical variegated sword-shaped leaves with striking golden edges.',
      price: 349,
      rating: 4.9,
      reviewsCount: 204,
      category: 'indoor' as const,
      image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n1',
      nurseryName: 'Himalayan Greens Nursery',
      stock: 45,
      light: 'low' as const,
      water: 'low' as const,
      difficulty: 'easy' as const,
      features: ['Air Purifying', 'Low Maintenance', 'Drought Tolerant'],
      size: 'Small (4" grower pot)',
      isPrime: true
    },
    {
      id: 'p3',
      name: 'Golden Money Plant Totem',
      scientificName: 'Epipremnum aureum',
      description: 'A classic trailing beauty loved across Indian homes, believed to bring prosperity. Features heart-shaped leaves marbled in shades of yellow and green. Trained up a sturdy moss pole for vertical elegance.',
      price: 299,
      rating: 4.7,
      reviewsCount: 88,
      category: 'indoor' as const,
      image: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n1',
      nurseryName: 'Himalayan Greens Nursery',
      stock: 18,
      light: 'indirect' as const,
      water: 'moderate' as const,
      difficulty: 'easy' as const,
      features: ['Air Purifying', 'Trailing Vine', 'Easy to Propagate'],
      size: 'Medium (6" hanger pot)',
      isPrime: false
    },
    {
      id: 'p4',
      name: 'Golden Barrel Cactus',
      scientificName: 'Echinocactus grusonii',
      description: 'This desert icon forms a striking, pale yellow globe with heavy ribbing and golden-yellow spines. Thrives in full sun on hot Indian rooftops or sunny balconies with minimal water.',
      price: 549,
      rating: 4.9,
      reviewsCount: 56,
      category: 'succulents' as const,
      image: 'https://images.unsplash.com/photo-1508022057371-4f937727f44b?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n2',
      nurseryName: 'Deccan Succulents & Palms',
      stock: 12,
      light: 'direct' as const,
      water: 'low' as const,
      difficulty: 'easy' as const,
      features: ['Drought Tolerant', 'Sun Lover', 'Unique Form'],
      size: 'Medium (5" ceramic pot)',
      isPrime: true
    },
    {
      id: 'p5',
      name: 'Echeveria Rose (Lola Succulent)',
      scientificName: 'Echeveria "Lola"',
      description: 'A delicate succulent rosette with pale gray-blue leaves tinged with pink. Features a self-sculpting geometry that looks stunning on sunny windowsills. Water only when the soil is completely dry.',
      price: 199,
      rating: 4.6,
      reviewsCount: 42,
      category: 'succulents' as const,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n2',
      nurseryName: 'Deccan Succulents & Palms',
      stock: 30,
      light: 'direct' as const,
      water: 'low' as const,
      difficulty: 'easy' as const,
      features: ['Compact Size', 'Pet Friendly', 'Geometric Rosette'],
      size: 'Small (3" grower pot)',
      isPrime: false
    },
    {
      id: 'p6',
      name: 'Sacred Tulsi Starter (Holy Basil)',
      scientificName: 'Ocimum tenuiflorum',
      description: 'The highly revered, sacred herb of India. Known for its extensive medicinal and spiritual qualities, this organically grown Tulsi is robust, fragrant, and ready to bring positive vibes to your home.',
      price: 99,
      rating: 4.8,
      reviewsCount: 142,
      category: 'herbs' as const,
      image: 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n3',
      nurseryName: 'Western Ghats Organic Nursery',
      stock: 50,
      light: 'direct' as const,
      water: 'high' as const,
      difficulty: 'easy' as const,
      features: ['Medicinal Herb', 'Aromatic', 'Stress Relief'],
      size: 'Small (3.5" peat pot)',
      isPrime: true
    },
    {
      id: 'p7',
      name: 'Kashmir Lavender Bloom',
      scientificName: 'Lavandula angustifolia',
      description: 'Highly aromatic lavender raised organically. Offers gorgeous purple flower spikes with stress-relieving fragrances. Thrives beautifully on airy balconies and sunny patios.',
      price: 349,
      rating: 4.8,
      reviewsCount: 93,
      category: 'herbs' as const,
      image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n3',
      nurseryName: 'Western Ghats Organic Nursery',
      stock: 22,
      light: 'direct' as const,
      water: 'low' as const,
      difficulty: 'medium' as const,
      features: ['Aromatic', 'Attracts Pollinators', 'Stress Relief'],
      size: 'Medium (6" grower pot)',
      isPrime: false
    },
    {
      id: 'p8',
      name: 'Fiddle Leaf Fig Premium',
      scientificName: 'Ficus lyrata',
      description: 'The ultimate designer plant. Features massive, violin-shaped glossy green leaves that make a dramatic modern statement. Demands bright, indirect sunlight and consistent watering schedules to shine.',
      price: 1399,
      rating: 4.4,
      reviewsCount: 112,
      category: 'indoor' as const,
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n1',
      nurseryName: 'Himalayan Greens Nursery',
      stock: 10,
      light: 'indirect' as const,
      water: 'moderate' as const,
      difficulty: 'hard' as const,
      features: ['Statement Tree', 'Glossy Leaves', 'Designer Favorite'],
      size: 'Large (10" grower pot, 4ft tall)',
      isPrime: true
    },
    {
      id: 'p9',
      name: 'Organic Panchagavya Plant Tonic',
      scientificName: 'N/A (Care Product)',
      description: 'A traditional Indian organic growth booster made from cow dung, urine, milk, curd, and ghee. Stimulates robust foliage growth, thick roots, and rich color. Dilute and feed plants twice monthly.',
      price: 249,
      rating: 4.8,
      reviewsCount: 156,
      category: 'pots-soil' as const,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n3',
      nurseryName: 'Western Ghats Organic Nursery',
      stock: 100,
      light: 'indirect' as const,
      water: 'moderate' as const,
      difficulty: 'easy' as const,
      features: ['100% Organic', 'All-Purpose', 'Nutrient Rich'],
      size: '500ml Spray Bottle',
      isPrime: true
    }
  ];

  let nurseries = [
    {
      id: 'n1',
      name: 'Himalayan Greens Nursery',
      rating: 4.8,
      reviewsCount: 312,
      location: 'Dehradun, Uttarakhand',
      description: 'Specializing in lush sub-Himalayan indoor foliage, rare tropicals, and organic parenting methods for house plants.',
      logo: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=200&h=200',
      banner: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1200&h=400'
    },
    {
      id: 'n2',
      name: 'Deccan Succulents & Palms',
      rating: 4.9,
      reviewsCount: 189,
      location: 'Pune, Maharashtra',
      description: 'Expertly cultivated succulents, desert roses, cacti, and drought-tolerant Deccan flora perfect for sun-drenched balconies.',
      logo: 'https://images.unsplash.com/photo-1520302630591-fd1c66ed11ef?auto=format&fit=crop&q=80&w=200&h=200',
      banner: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=1200&h=400'
    },
    {
      id: 'n3',
      name: 'Western Ghats Organic Nursery',
      rating: 4.7,
      reviewsCount: 245,
      location: 'Wayanad, Kerala',
      description: 'Organically grown culinary herbs, Ayurvedic starts, heirloom flower plants, and aromatic companion garden greens.',
      logo: 'https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?auto=format&fit=crop&q=80&w=200&h=200',
      banner: 'https://images.unsplash.com/photo-1534710961216-75c9740294c5?auto=format&fit=crop&q=80&w=1200&h=400'
    }
  ];

  let reviews = [
    {
      id: 'r1',
      productId: 'p1',
      userName: 'Aarav Sharma',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
      rating: 5,
      date: '2026-06-15',
      comment: 'Absolutely stunning Monstera! It arrived in Mumbai in pristine condition, packed in a customized secure cardboard capsule. Already got a massive leaf unfurling!',
      isVerified: true
    },
    {
      id: 'r2',
      productId: 'p1',
      userName: 'Priya Patel',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
      rating: 4,
      date: '2026-06-20',
      comment: 'Very healthy plant with zero pest issues. Delivered super fast to Delhi. The Himalayan Greens team is excellent at packaging.',
      isVerified: true
    },
    {
      id: 'r3',
      productId: 'p2',
      userName: 'Rohan Deshmukh',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
      rating: 5,
      date: '2026-06-28',
      comment: 'Indestructible snake plant! Kept it on my Pune desk and water it only twice a month. Stays beautifully green and shiny.',
      isVerified: true
    }
  ];

  // API Endpoints
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const newProduct = {
      ...req.body,
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      rating: 5.0,
      reviewsCount: 0
    };
    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.get("/api/nurseries", (req, res) => {
    res.json(nurseries);
  });

  app.get("/api/reviews/:productId", (req, res) => {
    const productReviews = reviews.filter(r => r.productId === req.params.productId);
    res.json(productReviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { productId, userName, rating, comment } = req.body;
    const newReview = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      productId,
      userName: userName || "Anonymous Sprout",
      userAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=100&h=100`,
      rating: Number(rating) || 5,
      date: new Date().toISOString().split('T')[0],
      comment: comment || "",
      isVerified: true
    };
    reviews.push(newReview);

    // Update product average rating
    const product = products.find(p => p.id === productId);
    if (product) {
      const prodReviews = reviews.filter(r => r.productId === productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      product.rating = Number(avg.toFixed(1));
      product.reviewsCount = prodReviews.length;
    }

    res.status(201).json(newReview);
  });

  // GEMINI API - AI Plant Doctor
  app.post("/api/gemini/diagnose", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "AI features are disabled because the API key is missing on the server. Please check your secrets." });
    }

    try {
      const { symptoms, imageBase64, imageMime } = req.body;

      let contents: any[] = [];

      // Multimodal payload if image is supplied
      if (imageBase64 && imageMime) {
        contents.push({
          inlineData: {
            mimeType: imageMime,
            data: imageBase64
          }
        });
      }

      contents.push({
        text: `You are a certified master botanist and plant nursery expert. Analyze the symptoms described: "${symptoms}".
        
        Provide an expert botanical diagnostic report formatted in Markdown:
        
        ### 🌱 Botanical Diagnostic Report
        
        #### 1. Primary Diagnosis & Cause
        - **What it looks like**: [Scientific & friendly name of issue]
        - **Core Cause**: [What exactly triggered this - e.g., low humidity, fluoride tap water, spider mites]
        
        #### 2. Severity Evaluation
        - **Status**: [Low / Moderate / Urgent]
        - **Explanation**: [Short note on what happens if ignored]
        
        #### 3. Nursery Doctor's Prescription
        - **Immediate First-Aid**: [Step-by-step immediate action - e.g., trim brown tips, flush soil]
        - **Long-term Care Adjustment**: [Water, light, and potting changes]
        
        #### 4. Recommended Treatments
        - **Physical Remedies**: [e.g., pruning, washing foliage]
        - **Marketplace Care Products**: Suggest care products the user can buy on the marketplace (e.g., neem oil, well-draining succulent soil mix, moisture meter).
        
        Keep your tone supportive, authoritative, professional, and full of natural warmth.`
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents
      });

      const text = response.text;
      res.json({ report: text });
    } catch (err: any) {
      console.error("Gemini diagnose error:", err);
      res.status(500).json({ error: "Failed to generate plant diagnostic report. " + err.message });
    }
  });

  // GEMINI API - AI Plant Matchmaker
  app.post("/api/gemini/recommend", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "AI features are disabled because the API key is missing on the server." });
    }

    try {
      const { answers } = req.body;

      const prompt = `You are an expert plant matchmaker. Based on the user's home conditions and care style:
      - Location preference: ${answers.location}
      - Sunlight availability: ${answers.light}
      - Watering frequency / habits: ${answers.watering}
      - Pet presence: ${answers.pets} (if yes, they need non-toxic, pet-safe plant recommendations)
      - Care level experience: ${answers.difficulty}
      - Size preference: ${answers.size}
      
      Generate a customized "Green Match Profile" in JSON format. Provide:
      1. A creative persona title matching their vibe (e.g. "The Desert Wanderer" or "The Lush Canopy Curator").
      2. A descriptive paragraph (profileMarkdown) explaining why this matches their care style and environment.
      3. An array of recommended product categories (choose from: 'indoor', 'outdoor', 'succulents', 'herbs', 'pots-soil', 'care-tools').
      4. An array of recommended plant features (choose from: 'Air Purifying', 'Low Maintenance', 'Drought Tolerant', 'Fast Growing', 'Pet Friendly', 'Aromatic', 'Unique Form').
      
      Return ONLY a raw JSON response that matches the schema:
      {
        "persona": "string",
        "profileMarkdown": "string",
        "recommendedCategories": ["string"],
        "recommendedFeatures": ["string"]
      }
      Do not include markdown backticks around the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              persona: { type: Type.STRING },
              profileMarkdown: { type: Type.STRING },
              recommendedCategories: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendedFeatures: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["persona", "profileMarkdown", "recommendedCategories", "recommendedFeatures"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText.trim());
      res.json(data);
    } catch (err: any) {
      console.error("Gemini matchmaker error:", err);
      res.status(500).json({ error: "Failed to generate plant matches. " + err.message });
    }
  });

  // GEMINI API - Product Q&A
  app.post("/api/gemini/qa", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "AI features are disabled because the API key is missing on the server." });
    }

    try {
      const { productName, productDescription, question } = req.body;

      const prompt = `You are a friendly nursery customer support assistant at our plant marketplace. A customer is looking at the plant "${productName}".
      Description of "${productName}": "${productDescription}".
      
      The customer's question is: "${question}".
      
      Provide a helpful, precise, conversational answer (around 2-3 sentences max) based on the plant's description and professional nursery knowledge. If the question is about pet-safety, toxicity, sunlight, or watering, be extremely clear and accurate. Keep it warm and polite.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      res.json({ answer: response.text });
    } catch (err: any) {
      console.error("Gemini QA error:", err);
      res.status(500).json({ error: "Failed to get an answer from the plant specialist." });
    }
  });

  // Vite development middleware or static production handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
