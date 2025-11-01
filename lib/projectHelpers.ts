import { supabase } from '@/lib/supabaseClient'

/**
 * Add a new project to Supabase
 * @param userId The user ID
 * @param project The project data
 * @returns Promise with the result of the operation
 */
export async function addProjectToSupabase(userId: string, project: any) {
  try {
    // Validate required fields
    if (!project.title || !project.description || !project.link) {
      return { success: false, error: 'Title, description, and link are required' }
    }

    // Generate a unique ID for the project
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const projectData = {
      id: projectId,
      profile_id: userId,
      title: project.title,
      description: project.description,
      banner_url: project.bannerUrl || null,
      link: project.link,
      upvotes: project.upvotes || 0,
      views: project.views || 0,
      created_at: new Date().toISOString()
    }

    // Insert the project into the projects table
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()

    if (error) {
      console.error('Error adding project to Supabase:', error)
      return { success: false, error: error.message }
    }

    // Update the user's project count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ projects_count: (await getUserProjectCount(userId)) + 1 })
      .eq('id', userId)

    if (updateError) {
      console.warn('Failed to update project count:', updateError)
    }

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Unexpected error adding project to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Update a project in Supabase
 * @param userId The user ID
 * @param project The project data with ID
 * @returns Promise with the result of the operation
 */
export async function updateProjectInSupabase(userId: string, project: any) {
  try {
    // Validate required fields
    if (!project.id || !project.title || !project.description || !project.link) {
      return { success: false, error: 'Project ID, title, description, and link are required' }
    }

    const projectData = {
      title: project.title,
      description: project.description,
      banner_url: project.bannerUrl || null,
      link: project.link,
      updated_at: new Date().toISOString()
    }

    // Update the project in the projects table
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', project.id)
      .eq('profile_id', userId)
      .select()

    if (error) {
      console.error('Error updating project in Supabase:', error)
      return { success: false, error: error.message }
    }

    if (data.length === 0) {
      return { success: false, error: 'Project not found or unauthorized' }
    }

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Unexpected error updating project in Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Delete a project from Supabase
 * @param userId The user ID
 * @param projectId The project ID
 * @returns Promise with the result of the operation
 */
export async function deleteProjectFromSupabase(userId: string, projectId: string) {
  try {
    // Delete the project from the projects table
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('profile_id', userId)

    if (error) {
      console.error('Error deleting project from Supabase:', error)
      return { success: false, error: error.message }
    }

    // Update the user's project count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ projects_count: Math.max(0, (await getUserProjectCount(userId)) - 1) })
      .eq('id', userId)

    if (updateError) {
      console.warn('Failed to update project count:', updateError)
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting project from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Get all projects for a user from Supabase
 * @param userId The user ID
 * @returns Promise with the user's projects
 */
export async function getUserProjectsFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user projects from Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error fetching user projects from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Get a specific project from Supabase
 * @param projectId The project ID
 * @returns Promise with the project data
 */
export async function getProjectFromSupabase(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project from Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error fetching project from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Add an upvote to a project in Supabase
 * @param projectId The project ID
 * @param userId The user ID of the voter
 * @returns Promise with the result of the operation
 */
export async function addProjectUpvoteToSupabase(projectId: string, userId: string) {
  try {
    // Check if the user has already upvoted this project
    const { data: existingUpvote, error: checkError } = await supabase
      .from('project_upvotes')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing upvote:', checkError)
      return { success: false, error: checkError.message }
    }

    // If user has already upvoted, return success without adding another upvote
    if (existingUpvote) {
      return { success: true }
    }

    // Add the upvote
    const { error: insertError } = await supabase
      .from('project_upvotes')
      .insert({
        project_id: projectId,
        user_id: userId,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error adding project upvote to Supabase:', insertError)
      return { success: false, error: insertError.message }
    }

    // Increment the project's upvote count
    const { error: updateError } = await supabase
      .rpc('increment_project_upvotes', { project_id: projectId })

    if (updateError) {
      console.warn('Failed to increment project upvotes:', updateError)
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error adding project upvote to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Increment project views in Supabase
 * @param projectId The project ID
 * @returns Promise with the result of the operation
 */
export async function incrementProjectViewsInSupabase(projectId: string) {
  try {
    // Increment the project's view count
    const { error } = await supabase
      .rpc('increment_project_views', { project_id: projectId })

    if (error) {
      console.error('Error incrementing project views in Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error incrementing project views in Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Get user project count from Supabase
 * @param userId The user ID
 * @returns Promise with the project count
 */
async function getUserProjectCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('profile_id', userId)

    if (error) {
      console.warn('Error fetching user project count:', error)
      return 0
    }

    return data.length
  } catch (error) {
    console.warn('Unexpected error fetching user project count:', error)
    return 0
  }
}

/**
 * Get trending projects from Supabase
 * @param limit Number of projects to return
 * @returns Promise with trending projects
 */
export async function getTrendingProjectsFromSupabase(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar
        )
      `)
      .order('upvotes', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching trending projects from Supabase:', error)
      return { success: false, error: error.message }
    }

    // Format the data to match expected structure
    const formattedProjects = data.map((project: any) => ({
      ...project,
      user: {
        username: project.profiles?.username,
        displayName: project.profiles?.display_name,
        avatar: project.profiles?.avatar
      }
    }))

    return { success: true, data: formattedProjects }
  } catch (error) {
    console.error('Unexpected error fetching trending projects from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}