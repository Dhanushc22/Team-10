import axios from 'axios';

// Backend HSN Search API (proxied through our Django backend)
const API_BASE_URL = 'http://localhost:8000';

class GSTSearchAPI {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Comprehensive HSN data for all types of furniture business
   */
  getMockData(searchText, type) {
    const mockData = [
      // HOME FURNITURE - Living Room
      {
        hsn_code: '9401',
        description: 'Seats - Sofas, armchairs, recliners, bean bags, ottomans',
        gst_rate: '12',
        search_terms: ['sofa', 'armchair', 'recliner', 'bean bag', 'ottoman', 'loveseat', 'sectional', 'couch', 'living room chair', 'accent chair']
      },
      {
        hsn_code: '9403',
        description: 'Living room furniture - TV units, coffee tables, side tables, display units',
        gst_rate: '12',
        search_terms: ['tv unit', 'coffee table', 'side table', 'center table', 'display unit', 'entertainment center', 'console table', 'nesting table']
      },
      
      // HOME FURNITURE - Bedroom
      {
        hsn_code: '9403',
        description: 'Bedroom furniture - Beds, wardrobes, dressers, nightstands, vanity tables',
        gst_rate: '12',
        search_terms: ['bed', 'wardrobe', 'dresser', 'nightstand', 'bedside table', 'vanity', 'chest of drawers', 'armoire', 'bedroom set', 'double bed', 'single bed', 'king bed', 'queen bed']
      },
      {
        hsn_code: '9404',
        description: 'Bedroom accessories - Mattresses, pillows, bed sheets, comforters',
        gst_rate: '12',
        search_terms: ['mattress', 'pillow', 'bed sheet', 'comforter', 'blanket', 'quilt', 'bedding', 'mattress topper', 'bed cover']
      },
      
      // HOME FURNITURE - Dining Room
      {
        hsn_code: '9403',
        description: 'Dining furniture - Dining tables, dining chairs, buffets, china cabinets',
        gst_rate: '12',
        search_terms: ['dining table', 'dining chair', 'buffet', 'china cabinet', 'dining set', 'kitchen table', 'bar table', 'breakfast table']
      },
      {
        hsn_code: '9401',
        description: 'Dining seating - Dining chairs, bar stools, bench seating',
        gst_rate: '12',
        search_terms: ['dining chair', 'bar stool', 'kitchen chair', 'bench', 'dining bench', 'counter stool', 'high chair']
      },
      
      // HOME FURNITURE - Kitchen
      {
        hsn_code: '9403',
        description: 'Kitchen furniture - Kitchen cabinets, kitchen islands, pantry units',
        gst_rate: '12',
        search_terms: ['kitchen cabinet', 'kitchen island', 'pantry', 'kitchen storage', 'modular kitchen', 'kitchen unit', 'base cabinet', 'wall cabinet']
      },
      
      // OFFICE FURNITURE
      {
        hsn_code: '9401',
        description: 'Office seating - Office chairs, executive chairs, ergonomic chairs, reception chairs',
        gst_rate: '12',
        search_terms: ['office chair', 'executive chair', 'ergonomic chair', 'reception chair', 'desk chair', 'swivel chair', 'conference chair', 'task chair', 'manager chair']
      },
      {
        hsn_code: '9403',
        description: 'Office furniture - Desks, office tables, cabinets, filing systems, workstations',
        gst_rate: '12',
        search_terms: ['desk', 'office table', 'office cabinet', 'filing cabinet', 'workstation', 'conference table', 'meeting table', 'reception desk', 'computer desk', 'executive desk', 'cubicle', 'office storage']
      },
      
      // SCHOOL FURNITURE
      {
        hsn_code: '9401',
        description: 'School seating - Student chairs, classroom chairs, auditorium seating',
        gst_rate: '12',
        search_terms: ['student chair', 'classroom chair', 'school chair', 'auditorium seat', 'lecture hall chair', 'campus chair', 'institutional chair']
      },
      {
        hsn_code: '9403',
        description: 'School furniture - Student desks, classroom tables, blackboards, lockers, library furniture',
        gst_rate: '12',
        search_terms: ['student desk', 'classroom table', 'school desk', 'blackboard', 'whiteboard', 'locker', 'library shelf', 'book shelf', 'teacher desk', 'lab table', 'laboratory furniture']
      },
      
      // OUTDOOR FURNITURE
      {
        hsn_code: '9401',
        description: 'Outdoor seating - Garden chairs, patio furniture, outdoor benches',
        gst_rate: '12',
        search_terms: ['garden chair', 'patio chair', 'outdoor chair', 'lawn chair', 'garden bench', 'outdoor bench', 'poolside chair', 'deck chair']
      },
      {
        hsn_code: '9403',
        description: 'Outdoor furniture - Garden tables, patio sets, outdoor storage, gazebos',
        gst_rate: '12',
        search_terms: ['garden table', 'patio table', 'outdoor table', 'garden set', 'patio set', 'outdoor storage', 'gazebo', 'pergola', 'garden furniture']
      },
      
      // COMMERCIAL & INSTITUTIONAL FURNITURE
      {
        hsn_code: '9401',
        description: 'Commercial seating - Restaurant chairs, hotel furniture, waiting room chairs',
        gst_rate: '12',
        search_terms: ['restaurant chair', 'hotel chair', 'waiting room chair', 'lobby chair', 'cafe chair', 'bar chair', 'commercial seating', 'banquet chair']
      },
      {
        hsn_code: '9403',
        description: 'Commercial furniture - Restaurant tables, hotel furniture, commercial displays',
        gst_rate: '12',
        search_terms: ['restaurant table', 'hotel furniture', 'commercial table', 'cafe table', 'lobby furniture', 'reception furniture', 'display rack', 'commercial display']
      },
      {
        hsn_code: '9402',
        description: 'Medical furniture - Hospital beds, medical chairs, clinic furniture',
        gst_rate: '12',
        search_terms: ['hospital bed', 'medical chair', 'dental chair', 'clinic furniture', 'examination table', 'patient chair', 'medical furniture']
      },
      
      // CHILDREN'S FURNITURE
      {
        hsn_code: '9401',
        description: 'Children\'s seating - Kids chairs, high chairs, baby furniture',
        gst_rate: '12',
        search_terms: ['kids chair', 'children chair', 'high chair', 'baby chair', 'nursery chair', 'toddler chair', 'youth chair']
      },
      {
        hsn_code: '9403',
        description: 'Children\'s furniture - Kids beds, toy storage, study tables, nursery furniture',
        gst_rate: '12',
        search_terms: ['kids bed', 'children bed', 'bunk bed', 'toy storage', 'toy box', 'study table', 'kids desk', 'nursery furniture', 'crib', 'baby furniture']
      },
      
      // SPECIALTY FURNITURE
      {
        hsn_code: '9403',
        description: 'Storage furniture - Almirahs, shoe racks, storage units, organizers',
        gst_rate: '12',
        search_terms: ['almirah', 'shoe rack', 'storage unit', 'organizer', 'storage cabinet', 'utility cabinet', 'multipurpose storage']
      },
      {
        hsn_code: '9403',
        description: 'Modular furniture - Modular units, space-saving furniture, convertible furniture',
        gst_rate: '12',
        search_terms: ['modular', 'space saving', 'convertible', 'foldable', 'multi-purpose', 'transformer furniture', 'compact furniture']
      },
      
      // RAW MATERIALS (same as before but with more search terms)
      {
        hsn_code: '4409',
        description: 'Wood strips, flooring, parquet, wooden planks, timber',
        gst_rate: '5',
        search_terms: ['wood', 'wooden', 'timber', 'plank', 'flooring', 'parquet', 'hardwood', 'softwood', 'teak', 'oak', 'pine', 'mahogany', 'rosewood']
      },
      {
        hsn_code: '4412',
        description: 'Plywood, veneered panels, laminated wood, MDF, particle board, OSB',
        gst_rate: '12',
        search_terms: ['plywood', 'veneer', 'mdf', 'particle board', 'laminate', 'chipboard', 'blockboard', 'osb', 'ply', 'marine ply']
      },
      {
        hsn_code: '4418',
        description: 'Wooden doors, windows, frames, shutters, carpentry work, moldings',
        gst_rate: '12',
        search_terms: ['door', 'window', 'frame', 'shutter', 'carpentry', 'wooden door', 'window frame', 'molding', 'trim', 'skirting']
      },
      
      // HARDWARE (expanded)
      {
        hsn_code: '8302',
        description: 'Furniture hardware - Hinges, handles, locks, drawer slides, casters',
        gst_rate: '18',
        search_terms: ['hinge', 'handle', 'hardware', 'fitting', 'drawer slide', 'knob', 'pull', 'latch', 'caster', 'wheel', 'bracket']
      },
      {
        hsn_code: '7318',
        description: 'Fasteners - Screws, bolts, nuts, washers, nails, rivets',
        gst_rate: '18',
        search_terms: ['screw', 'bolt', 'nut', 'washer', 'fastener', 'nail', 'rivet', 'stud', 'anchor']
      },
      
      // UPHOLSTERY & FABRICS
      {
        hsn_code: '5208',
        description: 'Natural fabrics - Cotton, linen, canvas, upholstery fabric',
        gst_rate: '5',
        search_terms: ['cotton', 'fabric', 'canvas', 'upholstery', 'cloth', 'textile', 'linen', 'natural fabric']
      },
      {
        hsn_code: '5407',
        description: 'Synthetic fabrics - Polyester, nylon, artificial leather, vinyl',
        gst_rate: '12',
        search_terms: ['synthetic', 'polyester', 'nylon', 'artificial fabric', 'plastic fabric', 'vinyl', 'faux leather', 'artificial leather']
      },
      
      // SERVICES
      {
        hsn_code: '999799',
        description: 'Transport services - Delivery, logistics, freight, moving services',
        gst_rate: '5',
        search_terms: ['transport', 'delivery', 'shipping', 'logistics', 'freight', 'cargo', 'moving', 'relocation']
      },
      {
        hsn_code: '997212',
        description: 'Installation services - Furniture assembly, installation, setup, mounting',
        gst_rate: '18',
        search_terms: ['installation', 'assembly', 'fitting', 'setup', 'mounting', 'fixing', 'carpentry service']
      },
      {
        hsn_code: '998361',
        description: 'Design services - Interior design, furniture design, space planning',
        gst_rate: '18',
        search_terms: ['interior design', 'decoration', 'design', 'consultation', 'planning', 'furniture design', 'space planning']
      }
    ];

    const searchTextLower = searchText.toLowerCase();
    const isNumeric = /^\d+$/.test(searchText);
    
    if (isNumeric || type === 'code') {
      return mockData.filter(item => item.hsn_code.includes(searchText));
    } else {
      return mockData.filter(item => {
        // Search in description
        const descMatch = item.description.toLowerCase().includes(searchTextLower);
        // Search in search terms
        const termMatch = item.search_terms.some(term => 
          term.toLowerCase().includes(searchTextLower)
        );
        return descMatch || termMatch;
      });
    }
  }

  /**
   * Search HSN codes by code
   * @param {string} code - HSN code to search for
   * @returns {Promise} API response with HSN suggestions
   */
  searchByCode(code) {
    return this.api.get('/master-data/hsn-search/', {
      params: {
        inputText: code,
        selectedType: 'byCode',
        category: 'null'
      }
    });
  }

  /**
   * Search HSN codes by product description
   * @param {string} description - Product description to search for
   * @returns {Promise} API response with HSN suggestions
   */
  searchByProductDescription(description) {
    return this.api.get('/master-data/hsn-search/', {
      params: {
        inputText: description,
        selectedType: 'byDesc',
        category: 'P'
      }
    });
  }

  /**
   * Search HSN codes by service description
   * @param {string} description - Service description to search for
   * @returns {Promise} API response with HSN suggestions
   */
  searchByServiceDescription(description) {
    return this.api.get('/master-data/hsn-search/', {
      params: {
        inputText: description,
        selectedType: 'byDesc',
        category: 'S'
      }
    });
  }

  /**
   * Generic search function that determines search type based on input
   * @param {string} searchText - Text to search for
   * @param {string} type - 'product', 'service', or 'code'
   * @returns {Promise} API response with HSN suggestions
   */
  async search(searchText, type = 'code') {
    try {
      const isNumeric = /^\d+$/.test(searchText);
      let response;
      
      if (isNumeric || type === 'code') {
        response = await this.searchByCode(searchText);
      } else if (type === 'service') {
        response = await this.searchByServiceDescription(searchText);
      } else {
        response = await this.searchByProductDescription(searchText);
      }
      
      return response;
    } catch (error) {
      // Fallback to mock data if backend API fails
      console.warn('Backend HSN API failed, using mock data:', error.message);
      const mockResults = this.getMockData(searchText, type);
      
      // Return in same format as axios response
      return {
        data: mockResults,
        status: 200,
        statusText: 'OK (Mock Data)'
      };
    }
  }
}

export const gstAPI = new GSTSearchAPI();
export default gstAPI;