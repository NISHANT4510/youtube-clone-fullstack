const mongoose = require('mongoose');

const searchCollection = async (model, query, options = {}) => {
  try {
    const {
      searchFields = [],
      sort = { createdAt: -1 },
      limit = 10,
      page = 1
    } = options;

    const searchQuery = {};
    
    // If search text is provided, create OR conditions for specified fields
    if (query.searchText && searchFields.length > 0) {
      searchQuery.$or = searchFields.map(field => ({
        [field]: { $regex: query.searchText, $options: 'i' }
      }));
    }

    // Add any additional filters
    if (query.filters) {
      Object.keys(query.filters).forEach(key => {
        searchQuery[key] = query.filters[key];
      });
    }

    const skip = (page - 1) * limit;
    
    const [results, total] = await Promise.all([
      model
        .find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      model.countDocuments(searchQuery)
    ]);

    return {
      results,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: skip + results.length < total
      }
    };
  } catch (error) {
    console.error('MongoDB search error:', error);
    throw error;
  }
};

module.exports = { searchCollection };
