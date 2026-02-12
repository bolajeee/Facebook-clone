import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed, clearFeed } from '../../store/slices/postsSlice';
import PostCard from '../../components/PostCard';
import SkeletonLoader from '../../components/SkeletonLoader';

/**
 * Feed Screen
 * 
 * Main feed implementation with:
 * - FlashList for performance (better than FlatList)
 * - Cursor-based pagination
 * - Pull-to-refresh
 * - Skeleton loading states
 * - Empty state
 * - Error handling
 */

export default function FeedScreen() {
    const dispatch = useDispatch();

    const {
        byId,
        allIds,
        isLoading,
        isRefreshing,
        isLoadingMore,
        hasMore,
        nextCursor,
        error,
    } = useSelector((state) => state.posts);

    // Convert normalized state to array for FlashList
    const posts = allIds.map((id) => byId[id]);

    // Initial load
    useEffect(() => {
        if (allIds.length === 0 && !isLoading) {
            dispatch(fetchFeed({ cursor: null, limit: 10 }));
        }
    }, []);

    // Pull to refresh
    const handleRefresh = useCallback(() => {
        dispatch(clearFeed());
        dispatch(fetchFeed({ cursor: null, limit: 10 }));
    }, [dispatch]);

    // Load more (pagination)
    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && hasMore && nextCursor) {
            dispatch(fetchFeed({ cursor: nextCursor, limit: 10 }));
        }
    }, [isLoadingMore, hasMore, nextCursor, dispatch]);

    // Render individual post
    const renderPost = useCallback(({ item }) => {
        return <PostCard post={item} />;
    }, []);

    // Footer: loading indicator when fetching more
    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#1877f2" />
            </View>
        );
    };

    // Empty state
    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View>
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>😕 Something went wrong</Text>
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>👋 Welcome to your feed!</Text>
                <Text style={styles.emptyText}>
                    Follow people to see their posts here
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlashList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                estimatedItemSize={400}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#1877f2']}
                        tintColor="#1877f2"
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#050505',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#65676b',
        textAlign: 'center',
        lineHeight: 20,
    },
});
