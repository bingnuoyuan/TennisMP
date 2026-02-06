// pages/photo-gallery/index.js

Page({
  data: {
    albums: [],
    loading: true,
    showPreview: false,
    previewPhotos: [],
    currentPreviewIndex: 0
  },

  onLoad: function () {
    this.loadPhotos();
  },

  // Load photos grouped by activity
  loadPhotos: function () {
    const that = this;
    
    // ========== Mock ==========
    const USE_MOCK = true;
    
    if (USE_MOCK) {
      // Helper function to generate photo array for a week
      const generatePhotos = (startNum, count) => {
        const photos = [];
        for (let i = 0; i < count; i++) {
          const num = (startNum + i).toString().padStart(3, '0');
          const path = `/images/gallery/photo-${num}.jpg`;
          photos.push({ id: startNum + i, url: path, thumbnail: path });
        }
        return photos;
      };

      // 102 photos - with varying counts (3,4,5,6) to show different layouts
      // Date format: Week X · Month Day, Year
      const mockAlbums = [
        { id: 1, week: 6, dateFormatted: 'Week 6 · February 5, 2026', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(1, 3) },    // 3 photos
        { id: 2, week: 5, dateFormatted: 'Week 5 · January 29, 2026', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(4, 4) },   // 4 photos
        { id: 3, week: 4, dateFormatted: 'Week 4 · January 22, 2026', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(8, 5) },   // 5 photos
        { id: 4, week: 3, dateFormatted: 'Week 3 · January 15, 2026', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(13, 6) },  // 6 photos
        { id: 5, week: 2, dateFormatted: 'Week 2 · January 8, 2026', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(19, 6) },
        { id: 6, week: 1, dateFormatted: 'Week 1 · January 1, 2026', subtitle: 'New Year Session 🎉', photos: generatePhotos(25, 6) },
        { id: 7, week: 52, dateFormatted: 'Week 52 · December 25, 2025', subtitle: 'Christmas Special 🎄', photos: generatePhotos(31, 6) },
        { id: 8, week: 51, dateFormatted: 'Week 51 · December 18, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(37, 6) },
        { id: 9, week: 50, dateFormatted: 'Week 50 · December 11, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(43, 6) },
        { id: 10, week: 49, dateFormatted: 'Week 49 · December 4, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(49, 6) },
        { id: 11, week: 48, dateFormatted: 'Week 48 · November 27, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(55, 6) },
        { id: 12, week: 47, dateFormatted: 'Week 47 · November 20, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(61, 6) },
        { id: 13, week: 46, dateFormatted: 'Week 46 · November 13, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(67, 6) },
        { id: 14, week: 45, dateFormatted: 'Week 45 · November 6, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(73, 6) },
        { id: 15, week: 44, dateFormatted: 'Week 44 · October 30, 2025', subtitle: 'Halloween Special 🎃', photos: generatePhotos(79, 6) },
        { id: 16, week: 43, dateFormatted: 'Week 43 · October 23, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(85, 6) },
        { id: 17, week: 42, dateFormatted: 'Week 42 · October 16, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(91, 6) },
        { id: 18, week: 41, dateFormatted: 'Week 41 · October 9, 2025', subtitle: 'Wednesday Tennis Session', photos: generatePhotos(97, 6) }
      ];
      
      setTimeout(() => {
        that.setData({
          albums: mockAlbums,
          loading: false
        });
      }, 500);
      return;
    }
    // ========== Mock End ==========

    // Real API call
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getPhotoAlbums'
      }
    }).then(res => {
      if (res.result && res.result.albums) {
        that.setData({
          albums: res.result.albums,
          loading: false
        });
      } else {
        that.setData({ loading: false });
      }
    }).catch(err => {
      console.error('Failed to load photos', err);
      that.setData({ loading: false });
      wx.showToast({
        title: 'Failed to load photos',
        icon: 'none'
      });
    });
  },

  // Preview photo - using custom modal instead of wx.previewImage
  previewPhoto: function (e) {
    const { albumIndex, photoIndex } = e.currentTarget.dataset;
    const album = this.data.albums[albumIndex];
    
    if (!album) return;
    
    this.setData({
      showPreview: true,
      previewPhotos: album.photos,
      currentPreviewIndex: photoIndex
    });
  },

  // Close preview
  closePreview: function () {
    this.setData({ showPreview: false });
  },

  // Handle swiper change
  onPreviewChange: function (e) {
    this.setData({ currentPreviewIndex: e.detail.current });
  },

  // Stop event propagation
  stopPropagation: function () {
    // Do nothing, just prevent bubble
  },

  // Pull to refresh
  onPullDownRefresh: function () {
    this.loadPhotos();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});

